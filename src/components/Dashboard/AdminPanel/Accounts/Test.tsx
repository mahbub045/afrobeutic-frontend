"use client";
import { useGetAccountsListQuery } from "@/Redux/Reducers/AdminPanel/Accounts/AccountsApi";

export interface TestProps {
  uid: string;
  name: string;
}

const Test: React.FC = () => {
  const { data: accountsList, isLoading } = useGetAccountsListQuery(undefined);
  console.log("CLG", accountsList);
  const exextractData = accountsList?.results;
  return (
    <div>
      {/* JSX here */}
      {isLoading && <p>Loading...</p>}
      {exextractData &&
        exextractData.map((account: TestProps) => (
          <div key={account.uid}>
            <h2>{account.name}</h2>
          </div>
        ))}
    </div>
  );
};

export default Test;
