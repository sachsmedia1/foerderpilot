import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugUserInfo() {
  const { data, isLoading, error } = trpc.participants.debugUserInfo.useQuery();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  if (!data) {
    return <div className="p-6">No data</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Debug: User & Participant Info</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current User (ctx.user)</CardTitle>
          <CardDescription>From authentication context</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data.currentUser, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participant by userId</CardTitle>
          <CardDescription>WHERE userId = {data.currentUser.id}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.participantByUserId ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(data.participantByUserId, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">❌ No participant found</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participant by email</CardTitle>
          <CardDescription>WHERE email = {data.currentUser.email}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.participantByEmail ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(data.participantByEmail, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">❌ No participant found</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participant by openId</CardTitle>
          <CardDescription>WHERE email = {data.currentUser.openId}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.participantByOpenId ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(data.participantByOpenId, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">❌ No participant found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
