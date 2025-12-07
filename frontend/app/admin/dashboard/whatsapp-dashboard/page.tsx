"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/doFetch";

type UserData = {
  id: number;
  name: string | null;
  phone: string | null;
};

export default function AdminWhatsAppDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = (await fetchApi.get("api/users/whatsapp/admin-data")) as {
          success: boolean;
          total: number;
          data: UserData[];
        };
        if (res.success) {
          setUsers(res.data);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Users</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border p-2">{user.id}</td>
              <td className="border p-2">{user.name || "Not Provided"}</td>
              <td className="border p-2">{user.phone || "Not Provided"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
