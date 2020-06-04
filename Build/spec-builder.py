import logging
import os
import shutil
import sys
import time
from subprocess import call
from subprocess import Popen
from os.path import expanduser

current_milli_time = lambda: int(round(time.time() * 1000))

logging.basicConfig(level=logging.INFO)

# constants
FILE_RUNTIME_FM = "C:\Program Files (x86)\Adobe\AdobeFrameMaker2015\FrameMaker.exe"
FILE_RUNTIME_ETSC = "C:\Program Files (x86)\Adobe\Adobe ExtendScript Toolkit CC\ExtendScript Toolkit.exe"
FILE_SPEC_BUILDER_JSX = "spec-builder.jsx"
FILE_BUILD_CONFIG = "build.config"
FILE_LOG = "extend-script.log"
FOLDER_TARGET = "target"
PROCESS_ID = "p" + str(current_milli_time())

BUILD_VERSION_DRAFT = ""

# get params
paramPathBook = sys.argv[1]  # path to book
paramLayout = sys.argv[2]    # layout
paramTitle = sys.argv[3]     # title
paramVersion = sys.argv[4]   # version
paramBuildNumber = ""        # build number
paramGitVersion = ""         # git version

if len(sys.argv) > 5:
    paramBuildNumber = sys.argv[5]  # build number
    paramGitVersion = sys.argv[6]   # git version

    BUILD_VERSION_DRAFT = " build " + paramBuildNumber + " (rev: " + paramGitVersion[:11] + ")"

# validate user input
book = ""
if os.path.exists(paramPathBook) and ".book" in paramPathBook:
    book = paramPathBook
else:
    msg = "Parameter '" + paramPathBook + "' is not allowed."
    logging.error(msg)
    raise Exception(msg)

if "XJDF-BLACK" != paramLayout and "JDF-BLACK" != paramLayout and "BOTH-COLORED" != paramLayout and "PLAIN" != paramLayout and "ICS" != paramLayout and "ICSMIS" != paramLayout and "ICSCUS" != paramLayout:
    msg = "Invalid parameter '" + paramLayout + "'. Allowed values are 'XJDF-BLACK', 'JDF-BLACK', 'BOTH-COLORED', 'PLAIN', 'ICS', 'ICSMIS', 'ICSCUS'."
    logging.error(msg)
    raise Exception(msg)

logging.info("Terminate running FrameMaker.exe if exists.")
Popen("TASKKILL /F /IM FrameMaker.exe")
time.sleep(5)

BUILD_LAYOUT = paramLayout
BUILD_VERSION = paramVersion.replace("$DATE", time.strftime('%Y%m%d')) + BUILD_VERSION_DRAFT
DOC_TITLE = paramTitle
BUILD_FILENAME = DOC_TITLE + " " + paramVersion.replace("$DATE", time.strftime('%Y%m%d'))

if paramBuildNumber != '':
    BUILD_FILENAME = BUILD_FILENAME + " build-" + paramBuildNumber

logging.info("Start Framemaker...")
FRAMEMAKER_PROCESS = Popen("\"" + FILE_RUNTIME_FM + "\"")

PAUSE_PERIODE = 6
logging.info("Wait for FrameMaker (%d sec.)..." % (PAUSE_PERIODE * 10))

while PAUSE_PERIODE > 0:
    time.sleep(10)
    PAUSE_PERIODE -= 1
    logging.info("%d secs..." % (PAUSE_PERIODE * 10))

logging.info("Start processing '" + book + "' ...")
logging.info("PROCESS_ID: " + PROCESS_ID)
logging.info("BUILD_LAYOUT: " + BUILD_LAYOUT)
logging.info("BUILD_FILENAME: " + BUILD_FILENAME)
logging.info("DOC_TITLE: " + DOC_TITLE)


#
# Clean up the Framemaker Sources of the JDF Specification.
#
def cleanupSources(dir):
    target = os.path.join(dir, FOLDER_TARGET)

    if os.path.exists(target):
        shutil.rmtree(target)

    files = os.listdir(dir)

    for f in files:
        path = os.path.join(dir, f)

        if ".backup.fm" in f:
            os.remove(path)
        elif ".recover.fm" in f:
            os.remove(path)
        elif ".recover-1.fm" in f:
            os.remove(path)
        elif ".backup.book" in f:
            os.remove(path)
        elif ".book." in f:
            os.remove(path)
        elif ".fm." in f:
            os.remove(path)
        elif ".fm.lck" in f:
            os.remove(path)
        elif " - Copy." in f:
            os.remove(path)
        elif "readme.doc" in f:
            os.remove(path)
        elif "build.config" in f:
            os.remove(path)


#
# Create a build config file.
#
def createConfig(sourceDir, targetDir):
    filename = os.path.join(targetDir, FILE_BUILD_CONFIG)

    file = open(filename, "w")
    file.write("build.filename=" + BUILD_FILENAME + "\n")
    file.write("build.layout=" + BUILD_LAYOUT + "\n")
    file.write("dir.source=" + sourceDir + "\\\n")
    file.write("dir.target=" + targetDir + "\\\n")
    file.write("file.book=" + book + "\n")
    file.write("file.logging=" + os.path.join(targetDir, FILE_LOG) + "\n")
    file.write("doc.title=" + DOC_TITLE + "\n")

    file.write("doc.cover_title=" + DOC_TITLE + "\n")
    file.write("doc.cover_version=" + BUILD_VERSION + "\n")
    file.write("doc.running_title=" + DOC_TITLE + " " + BUILD_VERSION + "\n")
    file.write("doc.cover_banner_1=" + "CoverBanner1" + "\n")
    file.write("doc.cover_banner_2=" + "CoverBanner2" + "\n")

    file.close()


#
# Run build process.
#
def runBuild(targetDir):
    # get adobe trusted script folder
    trustedScripts = os.path.join(expanduser("~"), "Documents\Adobe Scripts");

    if not os.path.exists(trustedScripts):
        os.makedirs(trustedScripts);
        logging.warning("Trusted Scripts Directory hasn't exist.")

    # deploy customized extend-script file to trusted location
    src = os.path.join(os.path.dirname(os.path.realpath(__file__)), FILE_SPEC_BUILDER_JSX)
    dest = os.path.join(trustedScripts, PROCESS_ID + "-" + FILE_SPEC_BUILDER_JSX)

    fileSrc = open(src, "r")
    fileDest = open(dest, "w")

    for line in fileSrc:

        if "[TEST-PROCESS]" in line:
            line = line.replace("[TEST-PROCESS]", "(Process-ID: " + PROCESS_ID + ")")
        elif "var PROCESS_ID =" in line:
            line = "var PROCESS_ID = \"" + PROCESS_ID + "\";"
        elif "var FILE_CONFIG =" in line:
            dir = os.path.join(targetDir, FILE_BUILD_CONFIG).replace("\\", "\\\\")
            line = "var FILE_CONFIG = \"" + dir + "\";"

        fileDest.write(line)

    fileSrc.close()
    fileDest.close();

    # prepare environment
    open(os.path.join(targetDir, FILE_LOG), "a").close()

    # run process
    logging.info("Start FrameMaker ExtendScript...")
    call([FILE_RUNTIME_ETSC, "-run", dest])


rootDir = os.path.dirname(book)

# cleanup directory
cleanupSources(rootDir)

# prepare build
targetDir = os.path.join(rootDir, "target")
os.makedirs(targetDir)
createConfig(rootDir, targetDir)

# start build
runBuild(targetDir)

# check running process
processFile = os.path.join(targetDir, PROCESS_ID)
logFile = open(os.path.join(targetDir, FILE_LOG), "r")
open(processFile, "a").close()

while os.path.isfile(processFile):
    where = logFile.tell()
    line = logFile.readline()

    if not line:
        time.sleep(1)
        logFile.seek(where)
    else:
        msg = line.rstrip()
        msg = msg[26:]
        logging.info("ExtendScript: " + msg)

logging.info("Close FrameMaker...")
FRAMEMAKER_PROCESS.terminate()

logging.info("-----------------------------")
logging.info(" BUILD SUCCESSFUL")
logging.info("-----------------------------")

sys.exit()
