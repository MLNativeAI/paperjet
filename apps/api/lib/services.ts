import { DocumentAnalysisService, DocumentExtractionService, WorkflowExecutionService, WorkflowService } from "@paperjet/engine";
import { Langfuse } from "langfuse";
import { envVars } from "./env";
import { s3 } from "./s3";

class ServiceFactory {
    private static instance: ServiceFactory;
    private _langfuse?: Langfuse;
    private _documentAnalysisService?: DocumentAnalysisService;
    private _documentExtractionService?: DocumentExtractionService;
    private _workflowExecutionService?: WorkflowExecutionService;
    private _workflowService?: WorkflowService;

    private constructor() {}

    static getInstance(): ServiceFactory {
        if (!ServiceFactory.instance) {
            ServiceFactory.instance = new ServiceFactory();
        }
        return ServiceFactory.instance;
    }

    get langfuse(): Langfuse {
        if (!this._langfuse) {
            this._langfuse = new Langfuse({
                secretKey: envVars.LANGFUSE_SECRET_KEY,
                publicKey: envVars.LANGFUSE_PUBLIC_KEY,
                baseUrl: envVars.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
            });
        }
        return this._langfuse;
    }

    get documentAnalysisService(): DocumentAnalysisService {
        if (!this._documentAnalysisService) {
            this._documentAnalysisService = new DocumentAnalysisService({ langfuse: this.langfuse });
        }
        return this._documentAnalysisService;
    }

    get documentExtractionService(): DocumentExtractionService {
        if (!this._documentExtractionService) {
            this._documentExtractionService = new DocumentExtractionService({ langfuse: this.langfuse });
        }
        return this._documentExtractionService;
    }

    get workflowExecutionService(): WorkflowExecutionService {
        if (!this._workflowExecutionService) {
            this._workflowExecutionService = new WorkflowExecutionService({
                langfuse: this.langfuse,
                extractionService: this.documentExtractionService,
                s3,
            });
        }
        return this._workflowExecutionService;
    }

    get workflowService(): WorkflowService {
        if (!this._workflowService) {
            this._workflowService = new WorkflowService({
                documentAnalysisService: this.documentAnalysisService,
                documentExtractionService: this.documentExtractionService,
                workflowExecutionService: this.workflowExecutionService,
                s3,
            });
        }
        return this._workflowService;
    }
}

// Export singleton instances
const serviceFactory = ServiceFactory.getInstance();

export const langfuse = serviceFactory.langfuse;
export const documentAnalysisService = serviceFactory.documentAnalysisService;
export const documentExtractionService = serviceFactory.documentExtractionService;
export const workflowExecutionService = serviceFactory.workflowExecutionService;
export const workflowService = serviceFactory.workflowService;
