## Processing architecture

The `queue` package contains workflow and job definitions and their handlers. This package controls the control flow of specific workflow types, but it delegates all the execution details to the `engine` package.

We have two types of workloads:

- jobs - these are primitive execution units that can fail, be retried & reused across different workflows. They are not exposed to the outside of this package
- workflows - these are the high-level orchestrators that spawn jobs, monitor their behaviour and are the facade of this package

The queueing logic is based upon BullMQ and Redis.
