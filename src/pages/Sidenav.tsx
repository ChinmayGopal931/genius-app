import { PageHeader, PageHeaderHeading } from "@/components/shadcn/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

export default function Sidenav() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Sidenav Layout</PageHeaderHeading>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description.</CardDescription>
        </CardHeader>
      </Card>
    </>
  );
}
