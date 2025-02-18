import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ModalProps = {
  itemName: string;
  onSelect: () => void;
  onOpenChange: (open: boolean) => void;
};

export function ModalAddProvider({
  itemName,
  onSelect,
  onOpenChange,
}: ModalProps) {
  return (
    <>
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger className="w-full text-left">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onSelect && onSelect();
            }}
          >
            {itemName}
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <form>
            <DialogHeader>
              <DialogTitle>Add new account</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                On the free plan, you can add up to 10 accounts.
              </DialogDescription>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account-name" className="font-medium">
                    Account name
                  </Label>
                  <Input
                    id="account-name"
                    name="account-name"
                    placeholder="My account"
                    className="mt-2"
                    type="text"
                  />
                </div>
                <div>
                  <Label htmlFor="account-type" className="font-medium">
                    Account type
                  </Label>
                  <Select defaultValue="transactional-account">
                    <SelectTrigger
                      id="account-type"
                      name="account-type"
                      className="mt-2"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional-account">
                        Transactional
                      </SelectItem>
                      <SelectItem value="savings-account">Savings</SelectItem>
                      <SelectItem value="other-account">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Label htmlFor="account-bsb" className="font-medium">
                    Account BSB
                  </Label>
                  <Input
                    id="account-bsb"
                    name="account-bsb"
                    placeholder="123-123"
                    className="mt-2"
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="account-number" className="font-medium">
                    Account number
                  </Label>
                  <Input
                    id="account-number"
                    name="account-number"
                    placeholder="123456789"
                    className="mt-2"
                    type="number"
                  />
                </div>
                <p className="col-span-2 text-xs text-gray-500">
                  Please ensure account details are correct or account linking
                  will fail.
                </p>
              </div>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button
                  className="mt-2 w-full sm:mt-0 sm:w-fit"
                  variant="secondary"
                >
                  Go back
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" className="w-full sm:w-fit">
                  Add account
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
