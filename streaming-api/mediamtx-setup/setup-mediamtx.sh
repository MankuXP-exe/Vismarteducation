#!/bin/bash
###############################################
# Vi Smart - MediaMTX VPS Setup Script
# Run as: bash setup-mediamtx.sh
# VPS: root@187.127.172.181
###############################################

set -e

echo "============================================="
echo " Vi Smart MediaMTX Streaming Server Setup"
echo "============================================="

MTX_VERSION="v1.11.2"
MTX_URL="https://github.com/bluenviron/mediamtx/releases/download/${MTX_VERSION}/mediamtx_${MTX_VERSION#v}_linux_amd64.tar.gz"
VPS_IP="187.127.172.181"
ROOT_DIR="/opt/vi-smart"

# ─── Step 1: System Updates ──────────────────
echo ""
echo "[1/10] Updating system packages..."
apt update -y
apt upgrade -y

# ─── Step 2: Install Dependencies ───────────
echo ""
echo "[2/10] Installing dependencies..."
apt install -y curl wget ffmpeg nginx certbot python3-certbot-nginx \
  htop iotop net-tools ufw jq bc

# ─── Step 3: Create Directory Structure ─────
echo ""
echo "[3/10] Creating directory structure..."
mkdir -p ${ROOT_DIR}/{recordings,notes,thumbnails,temp,hooks,logs,configs}
mkdir -p /etc/mediamtx
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled
chmod 755 ${ROOT_DIR}

# ─── Step 4: Install MediaMTX ───────────────
echo ""
echo "[4/10] Installing MediaMTX ${MTX_VERSION}..."

# Remove old version if exists
systemctl stop mediamtx 2>/dev/null || true
rm -f /usr/local/bin/mediamtx

# Download and install
cd /tmp
echo "Downloading from: ${MTX_URL}"
wget -q "${MTX_URL}" -O mediamtx.tar.gz || {
  echo "Download failed. Trying alternative..."
  # Try the v1 tag
  MTX_URL="https://github.com/bluenviron/mediamtx/releases/download/v1.11.2/mediamtx_v1.11.2_linux_amd64.tar.gz"
  wget -q "${MTX_URL}" -O mediamtx.tar.gz
}

tar -xzf mediamtx.tar.gz
mv mediamtx /usr/local/bin/mediamtx
chmod +x /usr/local/bin/mediamtx
rm -f mediamtx.tar.gz
rm -rf mediamtx_*

echo "MediaMTX version: $(/usr/local/bin/mediamtx --version 2>/dev/null || echo 'installed')"

# ─── Step 5: Configure MediaMTX ─────────────
echo ""
echo "[5/10] Configuring MediaMTX..."

cat > /etc/mediamtx/mediamtx.yml << 'MTXEOF'
###############################################
# MediaMTX - Vi Smart Education Streaming Server
# Optimized for freeze-free live streaming
###############################################

logLevel: info
logDestinations: [stdout]

# ─── Ports ───────────────────────────────────
rtsp: yes
protocols: [udp, kcp, tcp]
rtspAddress: :8554

rtmp: yes
rtmpAddress: :1935

hls: yes
hlsAddress: :8888
hlsAlwaysRemux: yes
hlsVariant: lowLatency
hlsSegmentCount: 4
hlsSegmentDuration: 500ms
hlsPartDuration: 200ms
hlsSegmentMaxSize: 10MiB
hlsEncryption: no

webrtc: yes
webrtcAddress: :8889
webrtcAdditionalHosts: [187.127.172.181]
webrtcICEUDPMuxAddress: :8890
webrtcICETCPMuxAddress: :8189

srt: yes
srtAddress: :1935

# ─── Recording ───────────────────────────────
record: yes
recordPath: /opt/vi-smart/recordings/{path}
recordFormat: fmp4
recordSegmentDuration: 1h
recordDeleteAfter: 0

# ─── Control API ─────────────────────────────
api: yes
apiAddress: :9997

# ─── Paths ───────────────────────────────────
paths:
  all_others:
    source: publisher
    record: yes
    recordPath: /opt/vi-smart/recordings/{path}
    recordFormat: fmp4
    webrtc: yes
    hls: yes
    rtsp: yes
    runOnReady: /opt/vi-smart/hooks/on-ready.sh
    runOnNotReady: /opt/vi-smart/hooks/on-not-ready.sh
    runOnRecord: /opt/vi-smart/hooks/on-record.sh

# ─── Performance ─────────────────────────────
writeQueueSize: 1024
readQueueSize: 1024
MTXEOF

echo "MediaMTX config written to /etc/mediamtx/mediamtx.yml"

# ─── Step 6: Create Hook Scripts ────────────
echo ""
echo "[6/10] Creating hook scripts..."

cat > /opt/vi-smart/hooks/on-ready.sh << 'HOOKEOF'
#!/bin/bash
PATH_NAME="${MTX_PATH:-unknown}"
echo "[$(date)] OnReady: Stream ready: $PATH_NAME" >> /opt/vi-smart/logs/hooks.log

# Extract class ID from path (format: live/{classId})
CLASS_ID=$(echo "$PATH_NAME" | sed 's|^live/||')

# Notify streaming API
curl -s -X POST http://127.0.0.1:3001/record/start \
  -H "Content-Type: application/json" \
  -H "x-api-secret: ${VPS_API_SECRET:-replace_with_long_random_secret}" \
  -d "{\"roomName\":\"$PATH_NAME\",\"liveClassId\":\"$CLASS_ID\",\"batchId\":\"\"}" \
  >> /opt/vi-smart/logs/hooks.log 2>&1 || true
HOOKEOF

cat > /opt/vi-smart/hooks/on-not-ready.sh << 'HOOKEOF'
#!/bin/bash
PATH_NAME="${MTX_PATH:-unknown}"
echo "[$(date)] OnNotReady: Stream ended: $PATH_NAME" >> /opt/vi-smart/logs/hooks.log
HOOKEOF

cat > /opt/vi-smart/hooks/on-record.sh << 'HOOKEOF'
#!/bin/bash
PATH_NAME="${MTX_PATH:-unknown}"
RECORD_FILE="${MTX_RECORD_PATH:-unknown}"
echo "[$(date)] OnRecord: $PATH_NAME -> $RECORD_FILE" >> /opt/vi-smart/logs/hooks.log
HOOKEOF

chmod +x /opt/vi-smart/hooks/*.sh
echo "Hook scripts created in /opt/vi-smart/hooks/"

# ─── Step 7: Systemd Service ────────────────
echo ""
echo "[7/10] Setting up systemd service..."

cat > /etc/systemd/system/mediamtx.service << 'SVCEOF'
[Unit]
Description=MediaMTX Streaming Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mediamtx /etc/mediamtx/mediamtx.yml
Restart=always
RestartSec=5
StartLimitBurst=5
StartLimitIntervalSec=60
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable mediamtx
systemctl start mediamtx

echo "MediaMTX service status:"
systemctl status mediamtx --no-pager || true

# ─── Step 8: Nginx Configuration ────────────
echo ""
echo "[8/10] Configuring Nginx..."

# First get SSL certs with HTTP-only configs
cat > /etc/nginx/sites-available/live.vismartlearningeducation.com << 'NGINXEOF'
server {
    listen 80;
    server_name live.vismartlearningeducation.com;

    location / {
        proxy_pass http://127.0.0.1:8888;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location ~ ^/live/(.+)/whip$ {
        proxy_pass http://127.0.0.1:8889/live/$1/whip;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_request_buffering off;
    }

    location ~ ^/live/(.+)/whep$ {
        proxy_pass http://127.0.0.1:8889/live/$1/whep;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
NGINXEOF

cat > /etc/nginx/sites-available/stream.vismartlearningeducation.com << 'NGINXEOF'
server {
    listen 80;
    server_name stream.vismartlearningeducation.com;

    client_max_body_size 10G;

    location /recordings/ {
        alias /opt/vi-smart/recordings/;
        add_header Accept-Ranges bytes;
        add_header Cache-Control "public, max-age=3600";
        add_header Access-Control-Allow-Origin "https://vismartlearningeducation.com" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range" always;
        autoindex off;
    }

    location /thumbnails/ {
        alias /opt/vi-smart/thumbnails/;
        add_header Cache-Control "public, max-age=86400";
        add_header Access-Control-Allow-Origin "*" always;
        autoindex off;
    }

    location /notes/ {
        alias /opt/vi-smart/notes/;
        add_header Cache-Control "public, max-age=3600";
        add_header Access-Control-Allow-Origin "https://vismartlearningeducation.com" always;
        autoindex off;
    }
}
NGINXEOF

cat > /etc/nginx/sites-available/api.vismartlearningeducation.com << 'NGINXEOF'
server {
    listen 80;
    server_name api.vismartlearningeducation.com;

    client_max_body_size 10G;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_request_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
NGINXEOF

# Enable sites
ln -sf /etc/nginx/sites-available/live.vismartlearningeducation.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/stream.vismartlearningeducation.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.vismartlearningeducation.com /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Start nginx
systemctl enable nginx
systemctl restart nginx

echo "Nginx configured (HTTP only for now, SSL coming next)"

# ─── Step 9: SSL with Certbot ───────────────
echo ""
echo "[9/10] Setting up SSL certificates..."

for domain in live.vismartlearningeducation.com stream.vismartlearningeducation.com api.vismartlearningeducation.com; do
  echo "Getting SSL for ${domain}..."
  certbot certonly --nginx -d "${domain}" --non-interactive --agree-tos --email admin@vismartlearningeducation.com || {
    echo "WARNING: Failed to get SSL for ${domain}. You can retry later with:"
    echo "  certbot certonly --nginx -d ${domain}"
  }
done

# Now apply full SSL configs
if [ -f /etc/letsencrypt/live/live.vismartlearningeducation.com/fullchain.pem ]; then
  cat > /etc/nginx/sites-available/live.vismartlearningeducation.com << 'NGINXEOF'
server {
    listen 443 ssl http2;
    server_name live.vismartlearningeducation.com;

    ssl_certificate /etc/letsencrypt/live/live.vismartlearningeducation.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/live.vismartlearningeducation.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 0;

    # HLS playback
    location /live/ {
        proxy_pass http://127.0.0.1:8888/live/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Access-Control-Allow-Origin "https://vismartlearningeducation.com" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range" always;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Access-Control-Expose-Headers "Content-Length, Content-Range";

        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://vismartlearningeducation.com";
            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
            add_header Access-Control-Allow-Headers "Range";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # WebRTC WHIP/WHEP
    location ~ ^/live/(.+)/whip$ {
        proxy_pass http://127.0.0.1:8889/live/$1/whip;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_request_buffering off;
    }

    location ~ ^/live/(.+)/whep$ {
        proxy_pass http://127.0.0.1:8889/live/$1/whep;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Default
    location / {
        proxy_pass http://127.0.0.1:8888;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}

server {
    listen 80;
    server_name live.vismartlearningeducation.com;
    return 301 https://$host$request_uri;
}
NGINXEOF

  # Repeat for stream and api domains...
  certbot --nginx -d live.vismartlearningeducation.com -d stream.vismartlearningeducation.com -d api.vismartlearningeducation.com --non-interactive --agree-tos --email admin@vismartlearningeducation.com || true
fi

systemctl restart nginx

# ─── Step 10: Firewall ──────────────────────
echo ""
echo "[10/10] Configuring firewall..."

ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8554/tcp  # RTSP
ufw allow 1935/tcp  # RTMP
ufw allow 8888/tcp  # HLS
ufw allow 8889/tcp  # WebRTC TCP
ufw allow 8890/udp  # WebRTC UDP
ufw allow 8189/udp  # WebRTC TCP Mux
ufw allow 3001/tcp  # Streaming API
ufw allow 9997/tcp  # MediaMTX API (internal only)

echo ""
echo "============================================="
echo " Setup Complete!"
echo "============================================="
echo ""
echo " MediaMTX Status:  systemctl status mediamtx"
echo " Nginx Status:     systemctl status nginx"
echo ""
echo " Domains:"
echo "   live.vismartlearningeducation.com  -> MediaMTX (WHIP/HLS)"
echo "   stream.vismartlearningeducation.com -> Recordings/Files"
echo "   api.vismartlearningeducation.com   -> Express API"
echo ""
echo " Ports:"
echo "   8554  - RTSP"
echo "   1935  - RTMP"
echo "   8888  - HLS"
echo "   8889  - WebRTC (WHIP/WHEP)"
echo "   8890  - WebRTC UDP Mux"
echo "   9997  - MediaMTX Control API"
echo ""
echo " Recording Path: /opt/vi-smart/recordings/"
echo " Logs:           /opt/vi-smart/logs/"
echo ""
echo " Next: Update frontend code to use correct URLs"
echo "============================================="
