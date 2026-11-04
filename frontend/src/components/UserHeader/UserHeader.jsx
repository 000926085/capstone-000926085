
import React, { useState, useEffect } from 'react';
import styles from './UserHeader.module.css';

export default function UserHeader({ initialUsers = [], onUsersChange, group_users, lastUpdated }) {
    const [usernames, setUsernames] = useState(initialUsers);
    const [input, setInput] = useState('');

    useEffect(() => {
        setUsernames(initialUsers);
    }, [initialUsers]);

    const handleAddUser = (e) => {
        e.preventDefault();
        const trimmed = input.trim();

        if (trimmed && !usernames.includes(trimmed)) {
            const nextUsers = [...usernames, trimmed];
            setInput('');
            if (onUsersChange) { onUsersChange(nextUsers); }
        }
    };

    const handleRemoveUser = (userToRemove) => {
        const nextUsers = usernames.filter((u) => u !== userToRemove);
        if (onUsersChange) { onUsersChange(nextUsers); }
    };

    console.log(group_users);


    return (
        <div className={styles['user-container']}>
            <div className={styles['header-top']}>
                <div className={styles['avatar-stack']}>
                    {group_users.map((user) => (
                        <img key={user.username} src={user.pfp} className={styles['userpfp']}
                        />
                    ))}
                </div>

                <div className={styles['user-info']}>
                <h2 style={{ color: 'black' }}>
                    Recommendations for{' '}
                    {usernames.length > 0 ? usernames.join(' & ') : '...'}
                </h2>
                <h3>Last Updated: {lastUpdated}</h3>
                </div>
            </div>

            <div className={styles['form-container']}>
                <form onSubmit={handleAddUser} className={styles['input-form']}>
                    <input 
                        type="text" 
                        placeholder="Add another username..." 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        className={`${styles['username-input']} shared-text-input`}
                    />
                    <button type="submit" className={styles['add-btn']}>+ Add</button>
                </form>
            </div>
        </div>
    )
}