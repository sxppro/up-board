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
    <TableSkeleton cols={2} rows={7} />
  ) : (
    <Table>
      <TableCaption>{`Transaction ID: ${data.id}`}</TableCaption>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Description</TableCell>
          <TableCell className="text-end">{data.description}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Amount</TableCell>
          <TableCell className="text-end">
            {formatCurrency(data.amountRaw)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Time</TableCell>
          <TableCell className="text-end">
            {new Date(data.time).toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Category</TableCell>
          <TableCell className="text-end">{data.category}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Parent Category</TableCell>
          <TableCell className="text-end">{data.parentCategory}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Status</TableCell>
          <TableCell className="text-end">{data.status}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Tags</TableCell>
          <TableCell className="text-end">
            {Array.isArray(data.tags) && data.tags.length > 0 ? (
              data.tags.map((tag: string) => <Badge key={tag}>{tag}</Badge>)
            ) : (
              <Button size="sm" variant="outline" className="h-6 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Add tag
              </Button>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default TransactionDetails;
