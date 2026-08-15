import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    const res = await api.get("/customers");
    setCustomers(res.data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const addCustomer = async (e) => {
    e.preventDefault();

    if (!name || !phone) {
      alert("Please fill all fields");
      return;
    }

    await api.post("/customers", { name, phone });

    setName("");
    setPhone("");
    loadCustomers();
  };

  const editCustomer = (customer) => {
    setEditId(customer.id);
    setName(customer.name);
    setPhone(customer.phone);
  };

  const updateCustomer = async (e) => {
    e.preventDefault();

    await api.put(`/customers/${editId}`, { name, phone });

    setEditId(null);
    setName("");
    setPhone("");
    loadCustomers();
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    await api.delete(`/customers/${id}`);
    loadCustomers();
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="customer-page">

      <div className="customer-header">
        <div>
          <h2>Customer Management</h2>
          <p>Total Customers: {customers.length}</p>
        </div>

        <input
          className="search-box"
          type="text"
          placeholder="🔍 Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="customer-card">

        <form
          className="customer-form"
          onSubmit={editId ? updateCustomer : addCustomer}
        >
          <input
            type="text"
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button className="save-btn">
            {editId ? "Update Customer" : "Add Customer"}
          </button>
        </form>

      </div>

      <div className="table-card">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th width="180">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>

                <td>{customer.id}</td>

                <td>{customer.name}</td>

                <td>{customer.phone}</td>

                <td>

                  <button
                    className="edit-btn"
                    onClick={() => editCustomer(customer)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteCustomer(customer.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}