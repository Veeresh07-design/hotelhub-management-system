
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="admin-navbar sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="admin-layout flex">
        <aside className="admin-sidebar-shell">
          <Sidebar />
        </aside>

        <main className="admin-content flex-1 min-w-0 p-5 md:p-8 lg:p-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
