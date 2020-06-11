# ICS-J-Base

**JDF Base ICS**

The CIP4 Base ICS for JDF defines the minimum conformance requirements for products that implement the JDF 1.7 specification. 

## Issue Tracking
TBD

## Development Notes
### Release a new Version
Creation and publishing of a new version to GitHub Release. 

```bash
$ git tag -a ICS-JDF-Base-[VERSION] -m "[TITLE]"
$ git push origin ICS-JDF-Base-[VERSION]
```

In case a build has been failed, a tag can be deleted using the following command:
```bash
$ git tag -d ICS-JDF-Base-[VERSION]
$ git push origin :refs/tags/ICS-JDF-Base-[VERSION]
```

### Build Artefacts
Each build process produces a single PDF. This is either a release version for public distribution, or a continuous integration (CI) build for use

### Build Process

CI builds are triggered by any 'push' or 'pull-request'.
Release builds are triggered by adding a git tag to a commit of the form 'Release-foobar. In this case the value of foobar will be used as the document identifier on both the cover and in the resulting artefact file name.


