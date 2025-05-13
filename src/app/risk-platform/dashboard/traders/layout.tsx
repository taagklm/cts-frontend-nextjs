
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col flex-grow min-h-screen pt-2">

            {children}
            <div className="p-5"></div>
        </div>
    )
}