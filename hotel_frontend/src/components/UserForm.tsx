import { useState } from "react";

interface UserFormProps {
  onSubmit: (user: User) => void;
  initial?: User;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  password: string;
}

export default function UserForm({ onSubmit, initial }: UserFormProps) {
  const [form, setForm] = useState<User>(initial || {
    email: "",
    firstName: "",
    lastName: "",
    role: "STAFF",
    active: true,
    password: ""
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox") {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm(f => ({
      ...f,
      [name]: fieldValue
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />{' '}
      <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required />{' '}
      <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />{' '}
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="ADMIN">ADMIN</option>
        <option value="MANAGER">MANAGER</option>
        <option value="STAFF">STAFF</option>
        <option value="CLIENT">CLIENT</option>
      </select>{' '}
      <label>
        Active <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
      </label>{' '}
      <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required={!initial} />{' '}
      <button type="submit">{initial ? "Update" : "Create"} User</button>
    </form>
  );
}
