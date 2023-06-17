"use client";
import axios from "axios";
import Button from "@/app/components/Button";
import Input from "../../components/inputs/Input";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "@/app/(site)/components/AuthSocialButton";
import { BsDiscord, BsGithub, BsGoogle } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);

  useEffect (() => {
    if (session?.status === 'authenticated') {
      router.push('/users');
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant === "REGISTER") {
      axios.post('/api/register', data)
      .then(() => signIn('credentials', data))
      .catch(() => toast.error('Somthing went wrong!'))
      .finally(() => setIsLoading(false))
    }
    if (variant === "LOGIN") {
      signIn('credentials', {
        ...data,
        redirect: false
      })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Invalid credentials');
        }
        if (callback?.ok && !callback?.error) {
          toast.success('Logged In!');
          router.push('/users');
        }
      })
      .finally(() => setIsLoading(false));
    }
  }

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false})
    .then((callback) => {
      if (callback?.error) {
        toast.error('Invalid Credentials')
      }
      if (callback?.ok && !callback?.error) {
        toast.success('Logged In!');
      }
    })
    .finally(() => setIsLoading(false));
    
  };

  return (
    <div
      className="
        mt-8
        sm:mx-auto
        sm:w-full
        sm:max-w-md
        "
    >
      <div
        className="
            bg-white
            px-4
            py-8
            shadow
            sm:rounded-lg
            sm:px-10
            "
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              register={register}
              errors={errors}
              id="name"
              label="Name"
              disabled={isLoading}
            />
          )}
          <Input
              register={register}
              errors={errors}
              type="email"
              id="email"
              label="Email address"
              disabled={isLoading}
            />
            <Input
              register={register}
              errors={errors}
              type="password"
              id="password"
              label="Password"
              disabled={isLoading}
            />
            
            <div>
                
                <Button
                disabled={isLoading}
                fullwidth
                type= 'submit'
                >
                    {variant === 'LOGIN' ? 'Sign in' : 'Register'}
                </Button>
            </div>

        </form>
        <div className="mt-6">
            <div className="relative">
                <div
                className="
                absolute
                inset-0
                flex
                items-center
                "
                >
                    <div className="w-full border-t border-gray-300"/>


                    

                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">
                        Or Continue with

                    </span>

                </div>

            </div>
            <div className="mt-6 flex gap-2">
                <AuthSocialButton 
                icon={BsGithub}
                onClick={() => socialAction('github')}
                />
                 <AuthSocialButton 
                icon={BsGoogle}
                onClick={() => socialAction('google')}
                />
                 <AuthSocialButton 
                icon={BsDiscord}
                onClick={() => socialAction('discord')}
                />

            </div>

        </div>
        <div className="
        flex
        gap-2
        justify-center
        text-sm
        mt-6
        px-2
        text-gray-500
        ">
            <div>
                {variant === 'LOGIN' ? 'New Commer?' : 'Already have an account?'}
            </div>
            <div
            onClick={toggleVariant}
            className="unserline cursor-pointer"
            >
                {variant === 'LOGIN' ? 'Create Account' : 'Login'}

            </div>


        </div>
      </div>
    </div>
  );
};

export default AuthForm;
