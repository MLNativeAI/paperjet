import { Link } from "@tanstack/react-router";
import { BlocksIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKFLOW_TEMPLATES } from "@/lib/template";

export default function WorkflowWizardPage() {
  return (
    <div className="w-full px-4 py-8 space-y-10 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New workflow</h1>
          <p className="text-muted-foreground mt-2">Pick one of our predefined templates or create your own</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">I want to start with an existing template</h2>
            <p className="text-muted-foreground mt-2">Pre-built templates for specific industries and use-cases</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Object.values(WORKFLOW_TEMPLATES).map((template) => {
          return (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>
                  <div className="flex gap-2 items-center">
                    {template.icon}
                    {template.name}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-20">
                <CardDescription>{template.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Link to={"/workflows/new"} search={{ templateId: template.id }} className="w-full">
                  <Button className="w-full ">Use this template</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">I want to define my own workflow</h2>
          <p className="text-muted-foreground mt-2">
            Add specific fields, lists and tables to create your own extraction schema
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex gap-2 items-center">
                <BlocksIcon />
                Empty workflow
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-20">
            <CardDescription>Start with an empty workflow and define the data structure yourself</CardDescription>
          </CardContent>
          <CardFooter>
            <Link to={"/workflows/new"} className="w-full">
              <Button className="w-full ">New workflow</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
