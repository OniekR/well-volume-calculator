import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";

const UiTest = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">UI Test</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Card title="Buttons">
            <div className="flex gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </Card>

          <Card title="Inputs" className="mt-4">
            <div className="space-y-2">
              <div>
                <Label>Default</Label>
                <Input placeholder="Enter value" />
              </div>
              <div>
                <Label>With error</Label>
                <Input hasError placeholder="Invalid" />
              </div>
              <div>
                <Label>Select</Label>
                <Select>
                  <option>One</option>
                  <option>Two</option>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Badge">
            <div className="flex gap-2">
              <Badge>Neutral</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UiTest;
