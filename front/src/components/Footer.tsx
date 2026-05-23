export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Photography Portfolio. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base rounded-lg text-sm"
          >
            GitHub
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base rounded-lg text-sm"
          >
            Instagram
          </a>
          <a href="mailto:hello@example.com" className="btn-base rounded-lg text-sm">
            邮箱
          </a>
        </div>
      </div>
    </footer>
  );
}
