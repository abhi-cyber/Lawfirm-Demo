import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import {ThemeToggle} from "@/components/ui";

const Settings = () => {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the application looks and feels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Theme
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select your preferred color scheme.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 dark:text-slate-400">
              Notification settings coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account information and security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 dark:text-slate-400">
              Account settings coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
