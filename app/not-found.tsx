import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center p-6 text-center">
      <Link href="/" className="mb-10">
        <Image src="/logo.svg" alt="Manokalpa" width={160} height={40} className="h-9 w-auto mx-auto" />
      </Link>

      <div className="w-24 h-24 rounded-3xl bg-brand-purple-pale flex items-center justify-center mx-auto mb-6 text-4xl">
        🧭
      </div>
      <h1 className="font-display text-4xl font-bold text-slate-900 mb-3">Page Not Found</h1>
      <p className="text-slate-500 text-lg max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="btn-primary">Go to Homepage</Link>
        <Link href="/dashboard" className="btn-secondary">Go to Dashboard</Link>
      </div>
    </div>
  );
}
