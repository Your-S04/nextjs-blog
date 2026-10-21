const startYear = 2026;

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 mt-8">
            <div className="max-w-2xl mx-auto p-4 text-sm text-gray-500 flex justify-between">
                <span>© {startYear}-{year} kiyone.top</span>
                <span>Powered by Next.js</span>
            </div>
        </footer>
    )
}