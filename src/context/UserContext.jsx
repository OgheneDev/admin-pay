import React, {useEffect, useState, useContext, createContext} from "react";
import { db, auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { collection, setDoc, updateDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const UserContext = createContext(null);

export const UserContextProvider = ({children}) => {
    const [users, setUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [newUser, setNewUser] = useState({
      username: '',
      email: '',
      password: '',
      balance: 0
    });
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'userInfo'));
          const usersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            username: doc.data().username || 'Unknown User',
            email: doc.data().email || 'Unknown Email',
            balance: doc.data().balance || 0,
            uid: doc.data().uid
          }));
          setUsers(usersData);
        } catch (err) {
          console.error('Error fetching users:', err);
          setError('Failed to load users');
        } finally {
          setLoading(false);
        }
      };
       
      fetchUsers();
    }, []);
  
    const handleCreateUser = async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
    
      if (newUser.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
    
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newUser.email,
          newUser.password
        );
    
        const userDocRef = doc(db, 'userInfo', userCredential.user.uid);
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          username: newUser.username,
          email: newUser.email,
          balance: parseFloat(newUser.balance),
          createdAt: new Date().toISOString()
        });
    
        const newUserData = {
          id: userCredential.user.uid,
          username: newUser.username,
          email: newUser.email,
          balance: parseFloat(newUser.balance)
        };
    
        setUsers([...users, newUserData]);
        setNewUser({ username: '', email: '', password: '', balance: 0 });
        setShowCreateModal(false);
      } catch (err) {
        let errorMessage = 'Failed to create user';
        
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email is already in use';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'User creation is currently disabled';
            break;
          default:
            errorMessage = err.message || 'An unexpected error occurred';
        }
    
        setError(errorMessage);
        console.error('Error creating user:', err);
      } finally {
        setLoading(false);
      }
    };
  
    const handleUpdateBalance = async (userId, newBalance) => {
      setLoading(true);
      try {
        const userRef = doc(db, 'userInfo', userId);
        await updateDoc(userRef, {
          balance: parseFloat(newBalance)
        });
    
        setUsers(users.map(user => 
          user.id === userId ? { ...user, balance: parseFloat(newBalance) } : user
        ));
        setShowEditModal(false);
        setSelectedUser(null);
      } catch (err) {
        console.error('Error updating balance:', err);
        setError('Failed to update balance');
      } finally {
        setLoading(false);
      }
    };
  
    const handleDeleteUser = async () => {
      if (!userToDelete) return;
  
      setLoading(true);
      try {
        const userRef = doc(db, 'userInfo', userToDelete.id);
        await deleteDoc(userRef);
  
        const currentUser = auth.currentUser;
        
        if (currentUser && currentUser.uid === userToDelete.id) {
          await deleteUser(currentUser);
        }
  
        setUsers(users.filter(user => user.id !== userToDelete.id));
        
        setShowDeleteModal(false);
        setUserToDelete(null);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. ' + err.message);
      } finally {
        setLoading(false);
      }
    };
  
    const filteredUsers = users.filter(user =>
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const value = {
        users,
        showCreateModal,
        showEditModal,
        showDeleteModal,
        selectedUser,
        userToDelete,
        searchTerm,
        loading,
        error,
        newUser,
        setUsers,
        setShowCreateModal,
        setShowEditModal,
        setShowDeleteModal,
        setSelectedUser,
        setUserToDelete,
        setSearchTerm,
        setLoading,
        setError,
        setNewUser,
        handleCreateUser,
        handleUpdateBalance,
        handleDeleteUser,
        filteredUsers
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within UserContextProvider");
        
    }
    return context;
}