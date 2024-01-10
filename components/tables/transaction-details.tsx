import { formatCurrency } from '@/utils/helpers';
import { useTransaction } from '@/utils/hooks';
import { Plus } from 'lucide-react';
import TableSkeleton from '../TableSkeleton';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from '../ui/table';

interface TransactionDetailsProps {
  transactionId: string;
}

const TransactionDetails = ({ transactionId }: TransactionDetailsProps) => {
  const { data, isLoading } = useTransaction(transactionId);

  return isLoading || !data ? (
    <TableSkeleton cols={2} rows={6} />
  ) : (
    <Table>
      <TableCaption>{`Transaction ID: ${data.id}`}</TableCaption>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Description</TableCell>
          <TableCell className="text-right">{data.description}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Amount</TableCell>
          <TableCell className="text-right">
            {formatCurrency(data.amountRaw)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Time</TableCell>
          <TableCell className="text-right">
            {new Date(data.time).toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Category</TableCell>
          <TableCell className="text-right">{data.category}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Parent Category</TableCell>
          <TableCell className="text-right">{data.parentCategory}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Status</TableCell>
          <TableCell className="text-right">{data.status}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Tags</TableCell>
          <TableCell className="text-right">
            {Array.isArray(data.tags) && data.tags.length > 0 ? (
              data.tags.map((tag: string) => <Badge key={tag}>{tag}</Badge>)
            ) : (
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add tag
              </Button>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default TransactionDetails;
