'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Loader2, ArrowLeft } from 'lucide-react';

export default function StaffLoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Staff Form
    const staffForm = useForm({
        defaultValues: {
            identifier: '', // changed from email to identifier
            password: '',
        },
    });

    const onStaffSubmit = async (data: { identifier: string; password: string }) => {
        setIsLoading(true);
        try {
            // Identifier can be email or username
            const user = await login({ email: data.identifier, password: data.password });

            toast.success('Zalogowano pomyślnie');

            // Redirect based on role
            if (user.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/staff/housekeeping');
            }

        } catch (error) {
            console.error(error);
            toast.error('Błąd logowania. Sprawdź login/email i hasło.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 space-y-4">
            <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Powrót do wyboru
            </Link>

            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <ClipboardList className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Strefa Personelu</h1>
                <p className="text-muted-foreground mt-2">Dostęp dla pracowników i administratorów</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Logowanie</CardTitle>
                    <CardDescription>
                        Użyj loginu służbowego lub adresu email
                    </CardDescription>
                </CardHeader>
                <form onSubmit={staffForm.handleSubmit(onStaffSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="identifier">Login lub Email</Label>
                            <Input
                                id="identifier"
                                type="text"
                                placeholder="jan.kowalski lub jan@hotel.com"
                                {...staffForm.register('identifier', { required: true })}
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Hasło</Label>
                            <Input
                                id="password"
                                type="password"
                                {...staffForm.register('password', { required: true })}
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full h-11" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Zaloguj się
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
