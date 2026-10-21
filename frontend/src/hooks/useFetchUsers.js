import { useState, useEffect } from 'react';

export function useFetchUsers() {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/admin-panel-fetch-users');
                if (!res.ok) throw new Error("An error occured during your request.");
                
                const data = await res.json();
                if (data) { 
                    setUsers(data.users); 
                } if (data.message) { setMessage(data.message); }

                
            } catch (err) { console.error(err); }
        };

        fetchUsers();
    }, []);

    return { users: users, message: message };
}