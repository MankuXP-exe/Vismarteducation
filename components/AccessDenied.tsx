import Link from "next/link";
import { ShieldAlert } from "lucide-react";

type Props = {
  message?: string;
  showBack?: boolean;
};

export default function AccessDenied({
  message = "You don't have access to this batch.",
  showBack = true,
}: Props) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        {showBack && (
          <Link
            href="/dashboard/batches"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Go to My Batches
          </Link>
        )}
      </div>
    </div>
  );
}
