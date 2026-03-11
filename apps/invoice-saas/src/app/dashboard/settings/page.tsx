'use client';
/**
 * Settings page: profile and defaults. Placeholder until auth is wired.
 */
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '@repo/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-base text-muted-foreground">Manage your account and preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <p className="text-base text-muted-foreground">Your name and email.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <Button>Save changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
