import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const WhatsApp: React.FC = () => {
    const startWhatsAppSignup = () => {
        // Logic to start WhatsApp signup process
    }
  return (
    <Card className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg dark:shadow-gray-600">
      <Button onClick={startWhatsAppSignup}>Connect WhatsApp</Button>
    </Card>
  );
};

export default WhatsApp;
