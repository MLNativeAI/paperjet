# PaperJet

PaperJet is a privacy-first document processing platform that creates custom AI workflows to process various document types and extract any desired information.

## Deployment

### Automatic Deployment with Coolify

This repository includes GitHub Actions workflows for automatic deployment to Coolify:

- **Development**: Automatically deploys to staging environment on every push to `main`
- **Production**: Automatically deploys to production on semantic releases

See [`.github/COOLIFY_SETUP.md`](.github/COOLIFY_SETUP.md) for detailed setup instructions.

### Manual Deployment

You can also deploy manually using Docker:

```bash
# Pull and run the latest release
docker pull mlnative/paperjet:latest
docker run -p 3000:3000 mlnative/paperjet:latest

# Or use development builds
docker pull mlnative/paperjet-dev:latest
docker run -p 3000:3000 mlnative/paperjet-dev:latest
```

## License

This project is licensed under the **[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)** for non-commercial use. 

### Commercial Use

For commercial use or deployments requiring a setup fee, please contact us
for a commercial license at [tomek@mlnative.com](mailto:tomek@mlnative.com).

By using this software, you agree to the terms of the license.