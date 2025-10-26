export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "v1.0.0"

  return (
    <footer className="bg-gray-800 text-gray-200 text-sm py-3 mt-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <p>© {new Date().getFullYear()} Expense Manager</p>
        <p>Version: <span className="font-mono">{version}</span></p>
      </div>
    </footer>
  )
}
