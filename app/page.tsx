import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        Find your next <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">
          remote opportunity
        </span>.
      </h1>
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">
        A minimalist job board tailored to your exact skills. Set up your profile and let our Playwright engine automatically scrape the best matches for you. No noise, just jobs.
      </p>
      
      <div className="flex space-x-4">
        <Link 
          href="/jobs" 
          className="px-6 py-3 rounded-md bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
        >
          Explore Jobs
        </Link>
        <Link 
          href="/profile" 
          className="px-6 py-3 rounded-md border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
        >
          Setup Profile
        </Link>
      </div>
    </div>
  );
}
