import { Skeleton } from './ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const TableSkeleton = ({ cols, rows }: { cols: number; rows: number }) => {
  return (
    <Table>
      <TableCaption>
        Hi there! We&apos;re getting your transactions ...
      </TableCaption>
      <TableHeader>
        <TableRow>
          {[...Array(cols)].map((i) => (
            <TableHead key={i}>
              <Skeleton className="w-full h-4" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((i) => (
          <TableRow key={i}>
            {[...Array(cols)].map((i) => (
              <TableCell key={i}>
                <Skeleton className="w-full h-2" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
