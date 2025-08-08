import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface CardReportsProps {
  title: string;
  description: string;
  children: React.ReactNode;
  tabs: {
    label: string;
    value: string;
  }[];
}

export function CardReports({
  title,
  description,
  children,
  tabs,
}: CardReportsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-md">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={tabs[0]?.value}>
          <TabsList className="mb-4 ">
            {tabs?.map((tab) => (
              <TabsTrigger 
                key={tab?.value} 
                value={tab?.value}
                className="px-4 flex-none"
              >
                {tab?.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {children}
        </Tabs>
      </CardContent>
    </Card>
  );
}
