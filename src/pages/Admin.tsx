
import AdminPanel from "@/components/AdminPanel";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-navy-dark mb-8 text-center">
          Newsletter Admin Panel
        </h1>
        <div className="max-w-md mx-auto">
          <AdminPanel />
        </div>
      </div>
    </div>
  );
};

export default Admin;
