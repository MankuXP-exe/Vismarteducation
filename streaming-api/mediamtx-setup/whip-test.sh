#!/bin/bash
curl -s http://127.0.0.1:8889/live/test/whip -X POST \
  -H "Content-Type: application/sdp" \
  -H "Authorization: Basic dGVhY2hlcjpWaVNtYXJ0TGl2ZTIwMjYh" \
  -d 'v=0
o=- 1234 1 IN IP4 127.0.0.1
s=-
t=0 0
a=ice-pwd:test123456789012345678901234
a=ice-ufrag:test
a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=rtpmap:96 H264/90000
a=sendonly
a=mid:0'
