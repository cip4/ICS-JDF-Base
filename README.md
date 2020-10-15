# JDF Base ICS
Because the JDF Specification is quite large, it is unrealistic (and not very useful) for any JDF enabled product to implement the JDF Specificaion in full. Yet, if each JDF enabled product were to implement an arbitrary subset of the JDF Specificaion, interoperability between JDF enabled products would be highly unlikely.

Hence, there is a need for a number of well specified subsets of JDF, each defining an interface between pairs of vendor’s products in the workflow. The mechanism for specifying such a subset of JDF is the Interoperability Conformance Specification (ICS). An ICS defines a subset of JDF by means of Conformance Requirements, which are a set of requirements.

When a JDF enabled product meets the manager Conformance Requirement of a particular ICS, it achieves interoperability with other JDF enabled products that meet the corresponding Worker Conformance Requirements of the same ICS. Note: The definitions of ‘this type of term’ appear in Section 1.1 Glossary.
JDF is a very comprehensive job ticket format that allows for many different ways to specify a digital print job. To minimize complexity and to better guarantee interoperability between JDF producers and consumers, this ICS identifies a relatively small subset of JDF for digital wide format printing.

A description of the conformance tables and other ICS notation can be found in the CIP4 Base ICS.

<br />

## Issue Tracking
TBD 

<br />

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

CI builds are triggered by any 'push' to the [MASTER] branch.<br/>
There is an option to trigger this build manually in the event that an automated CI build fails due to issues with the build process.

Release builds are triggered by adding a git tag to a commit. The value of tag will be used as the document identifier on both the cover and in the resulting artefact file name.<br/>
For example use a tag of 'Draft-IP-4' or 'Version 2.1 Final'.<br/>
There is alos an option to trigger this build manually.
