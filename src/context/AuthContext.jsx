import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';
import {
  auth,
  registerWithEmailPassword,
  loginWithEmailPassword,
  loginWithGoogle,
  logoutFirebase,
  subscribeToAuthState,
} from '../firebase/config.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const idToken = await user.getIdToken();
          const res = await api.get('/auth/me-unified', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          if (res.data?.success) {
            if (res.data.student) {
              setStudent(res.data.student);
            } else {
              setStudent(null);
            }
            if (res.data.admin && res.data.isAdmin) {
              setAdmin(res.data.admin);
              localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
            } else if (!localStorage.getItem('admin_token')) {
              setAdmin(null);
              localStorage.removeItem('admin_user');
            }
          }
        } catch (err) {
          // Fallback check
          try {
            const studentRes = await api.get('/auth/student/me');
            if (studentRes.data?.success && studentRes.data?.student) {
              setStudent(studentRes.data.student);
              if (studentRes.data.admin && studentRes.data.isAdmin) {
                setAdmin(studentRes.data.admin);
                localStorage.setItem('admin_user', JSON.stringify(studentRes.data.admin));
              }
            }
          } catch {
            setStudent(null);
          }
        }
      } else {
        setStudent(null);
        if (!localStorage.getItem('admin_token')) {
          setAdmin(null);
          localStorage.removeItem('admin_user');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ---------------- AUTH ACTIONS ----------------

  // 1. Student / First User Registration
  const studentRegister = async ({
    name,
    email,
    password,
    whatsapp,
    location = {},
    education = {},
  }) => {
    setLoading(true);
    try {
      // 1. Create Firebase Auth user
      const userCredential = await registerWithEmailPassword(email, password);
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();

      // 2. Create MongoDB Student & check First User Super Admin
      const res = await api.post(
        '/auth/student/register',
        {
          firebaseUid: fbUser.uid,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          whatsapp: whatsapp.trim(),
          photoURL: fbUser.photoURL || '',
          location,
          education,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (res.data?.success) {
        setStudent(res.data.student);
        if (res.data.admin && (res.data.isAdmin || res.data.isFirstUser)) {
          setAdmin(res.data.admin);
          localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        }
        setFirebaseUser(fbUser);
        return {
          success: true,
          isFirstUser: res.data.isFirstUser,
          isAdmin: res.data.isAdmin,
          role: res.data.role,
          student: res.data.student,
          admin: res.data.admin,
        };
      }

      return { success: false, message: res.data?.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।' };
    } catch (error) {
      console.error('[Register Error]', error);
      let msg = error.response?.data?.message || error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।';
      } else if (error.code === 'auth/weak-password') {
        msg = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'সঠিক ইমেইল ঠিকানা প্রদান করুন।';
      }
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // 2. Unified Login (Email & Password) for both Admin and Student
  const unifiedLogin = async (email, password) => {
    setLoading(true);
    try {
      let fbUser = null;
      let idToken = null;

      // 1. Try Firebase Auth sign in
      try {
        const userCredential = await loginWithEmailPassword(email, password);
        fbUser = userCredential.user;
        idToken = await fbUser.getIdToken();
        setFirebaseUser(fbUser);
      } catch (fbErr) {
        console.warn('[Firebase Sign In Notice]:', fbErr.code || fbErr.message);
        // If wrong credentials in Firebase, check if it's a legacy admin password
        if (
          fbErr.code === 'auth/wrong-password' ||
          fbErr.code === 'auth/user-not-found' ||
          fbErr.code === 'auth/invalid-credential'
        ) {
          try {
            const legacyRes = await api.post('/auth/login', { email, password });
            if (legacyRes.data?.success && legacyRes.data?.admin) {
              const newToken = legacyRes.data.token;
              const newAdmin = legacyRes.data.admin;
              setToken(newToken);
              setAdmin(newAdmin);
              localStorage.setItem('admin_token', newToken);
              localStorage.setItem('admin_user', JSON.stringify(newAdmin));
              return {
                success: true,
                isAdmin: true,
                isSuperAdmin: newAdmin.role === 'super_admin',
                role: newAdmin.role,
                admin: newAdmin,
              };
            }
          } catch {}
        }

        let msg = 'ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে সঠিক তথ্য দিন।';
        if (fbErr.code === 'auth/too-many-requests') {
          msg = 'অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
        }
        return { success: false, message: msg };
      }

      // 2. Verify and obtain profile from backend
      const res = await api.post('/auth/unified-login', { idToken });
      if (res.data?.success) {
        if (res.data.needProfile) {
          return {
            success: true,
            needProfile: true,
            fbUser,
            message: 'প্রোফাইল সম্পন্ন করা আবশ্যক।',
          };
        }

        if (res.data.student) {
          setStudent(res.data.student);
        } else {
          setStudent(null);
        }

        if (res.data.admin && res.data.isAdmin) {
          setAdmin(res.data.admin);
          localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        } else {
          setAdmin(null);
          localStorage.removeItem('admin_user');
        }

        return {
          success: true,
          isAdmin: res.data.isAdmin,
          isSuperAdmin: res.data.isSuperAdmin,
          role: res.data.role,
          student: res.data.student,
          admin: res.data.admin,
        };
      }

      return {
        success: false,
        message: res.data?.message || 'লগইন সম্পন্ন করা যায়নি।',
      };
    } catch (error) {
      console.error('[Unified Login Error]', error);
      const msg = error.response?.data?.message || error.message || 'লগইন ব্যর্থ হয়েছে।';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // 3. Unified Google Login
  const unifiedGoogleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await loginWithGoogle();
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken();
      setFirebaseUser(fbUser);

      // Verify and obtain profile from backend
      try {
        const res = await api.post('/auth/unified-login', { idToken });
        if (res.data?.success) {
          if (res.data.needProfile) {
            return {
              success: true,
              needProfile: true,
              fbUser,
            };
          }

          if (res.data.student) {
            setStudent(res.data.student);
          } else {
            setStudent(null);
          }

          if (res.data.admin && res.data.isAdmin) {
            setAdmin(res.data.admin);
            localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
          } else {
            setAdmin(null);
            localStorage.removeItem('admin_user');
          }

          return {
            success: true,
            isAdmin: res.data.isAdmin,
            isSuperAdmin: res.data.isSuperAdmin,
            role: res.data.role,
            student: res.data.student,
            admin: res.data.admin,
          };
        }
      } catch (err) {
        if (err.response?.status === 404 || err.response?.data?.needProfile) {
          return {
            success: true,
            needProfile: true,
            fbUser,
          };
        }
      }

      return { success: true, fbUser };
    } catch (error) {
      console.error('[Google Login Error]', error);
      return {
        success: false,
        message: error.message || 'গুগল দিয়ে লগইন সম্পন্ন করা যায়নি।',
      };
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Student Profile
  const updateStudentProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/student/profile', profileData);
      if (res.data?.success && res.data?.student) {
        setStudent(res.data.student);
        return { success: true, student: res.data.student };
      }
      return { success: false, message: res.data?.message || 'প্রোফাইল আপডেট করা যায়নি।' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'প্রোফাইল সংরক্ষণে ত্রুটি হয়েছে।',
      };
    }
  };

  // 5. Unified Logout
  const unifiedLogout = async () => {
    try {
      await logoutFirebase();
    } catch (err) {
      console.error('[Logout Error]', err);
    }
    setStudent(null);
    setAdmin(null);
    setFirebaseUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  // Aliases for comprehensive backward compatibility
  const login = unifiedLogin;
  const studentLogin = unifiedLogin;
  const adminLogin = unifiedLogin;
  const studentGoogleLogin = unifiedGoogleLogin;
  const googleLogin = unifiedGoogleLogin;
  const logout = unifiedLogout;
  const studentLogout = unifiedLogout;
  const adminLogout = unifiedLogout;

  const isSuperAdmin = admin?.role === 'super_admin';
  const isAdmin = admin?.role === 'admin' || isSuperAdmin;
  const isContentEditor = admin?.role === 'content_editor' || admin?.role === 'editor' || isAdmin;
  const isEditor = isContentEditor;
  const isStudent = Boolean(student);

  return (
    <AuthContext.Provider
      value={{
        // Unified / Student state & methods
        student,
        firebaseUser,
        studentRegister,
        register: studentRegister,
        studentLogin,
        studentGoogleLogin,
        googleLogin,
        studentLogout,
        updateStudentProfile,
        isStudent,

        // Admin state & methods
        admin,
        token,
        adminLogin,
        adminLogout,
        isSuperAdmin,
        isAdmin,
        isContentEditor,
        isEditor,

        // Common
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
