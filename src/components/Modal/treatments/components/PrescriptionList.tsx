import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PrescriptionListProps {
  prescriptions: any[];
}

export function PrescriptionList({ prescriptions }: PrescriptionListProps) {
  if (!prescriptions || prescriptions.length === 0) return null;

  return (
    <div className="col-span-2 space-y-4">
      <h3 className="text-lg font-semibold">Đơn thuốc</h3>
      <div className="grid gap-4">
        {prescriptions.map((prescription: any) => (
          <Card key={prescription.$id}>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thuốc</TableHead>
                    <TableHead>Liều lượng</TableHead>
                    <TableHead>Tần suất</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescription.prescription_info?.map((medication: any, medIndex: number) => {
                    const medInfo = JSON.parse(medication);
                    return (
                      <TableRow key={medIndex}>
                        <TableCell>{medInfo.medicine_name}</TableCell>
                        <TableCell>{medInfo.dosage}</TableCell>
                        <TableCell>{medInfo.frequency}</TableCell>
                        <TableCell>{medInfo.duration}</TableCell>
                        <TableCell>{medInfo.amount}</TableCell>
                        <TableCell>{prescription.price}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {prescription.instruction && (
                <div className="mt-4">
                  <h4 className="mb-1 text-sm font-medium">Hướng dẫn:</h4>
                  <p className="text-sm text-muted-foreground">
                    {prescription.instruction}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 