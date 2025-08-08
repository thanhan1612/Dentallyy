import ProtectedLayout from "@/app/(protected)/layout";
import { PageContainer } from "@/components/PageContainer/page-container";
import { ClinicSettings } from "@/components/Settings/clinic-setting";
import { NotificationSettings } from "@/components/Settings/notification-settings";
import { ProfileSettings } from "@/components/Settings/profile-setting";
import { SystemSettings } from "@/components/Settings/system-settings";
import { UserManagement } from "@/components/Settings/user-management-setting";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <PageContainer title="Cài Đặt" actions={false}>
        <div>
        <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="clinic">Phòng khám</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>
        <Card className="mt-6 border">
          <TabsContent value="profile" className="p-6">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="clinic" className="p-6">
            <ClinicSettings />
          </TabsContent>
          <TabsContent value="users" className="p-6">
            <UserManagement />
          </TabsContent>
          <TabsContent value="system" className="p-6">
            <SystemSettings />
          </TabsContent>
          <TabsContent value="notifications" className="p-6">
            <NotificationSettings />
          </TabsContent>
        </Card>
      </Tabs>
        </div>
      </PageContainer>
    </ProtectedLayout>
  );
}
