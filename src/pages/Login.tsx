
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img 
          src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" 
          alt="Air Georgia Logo" 
          className="mx-auto h-16 w-auto" 
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
        
        <p className="mt-6 text-center text-sm text-gray-600">
          For this demo, please select a role to log in with different access levels
        </p>
      </div>
    </div>
  );
};

export default Login;
