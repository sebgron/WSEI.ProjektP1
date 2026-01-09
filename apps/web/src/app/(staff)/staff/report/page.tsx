'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { staffAPI } from '@/lib/staff-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench, Loader2, CheckCircle2 } from 'lucide-react';

export default function ReportIssuePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [roomNumber, setRoomNumber] = useState('');
    const [description, setDescription] = useState('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomNumber || !description) {
            toast.error('Wypełnij wszystkie pola');
            return;
        }

        setIsLoading(true);
        try {
            await staffAPI.reportIssue({
                roomId: parseInt(roomNumber),
                description
            });
            toast.success('Zgłoszenie zostało wysłane');
            setRoomNumber('');
            setDescription('');
            router.push('/staff/housekeeping');
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się wysłać zgłoszenia');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Zgłoś Usterkę</h1>
                <p className="text-muted-foreground text-sm">Zauważyłeś problem? Zgłoś go tutaj</p>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Nowe zgłoszenie</CardTitle>
                            <CardDescription>Zadanie trafi do listy napraw</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="room">Numer pokoju</Label>
                            <Input
                                id="room"
                                type="number"
                                placeholder="np. 101"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="text-lg font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Opis usterki</Label>
                            <Input
                                id="description"
                                placeholder="Co nie działa?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Wysyłanie...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Wyślij zgłoszenie
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
