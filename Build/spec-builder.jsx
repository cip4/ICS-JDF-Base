#target framemaker

/**
 * This script creates PDF documents from Framemaker book.
 * For the JDF/XJDF specification this requires application and selection of variables, formats etc
 * to ensure the correct version is produced, ie the JDF 1.x, XJDF 2.x or Both. 
 * The latter is the editing working version.
 **/
var TEMPLATE_JDF = "Template_V5_JDF1x.fm";
var TEMPLATE_XJDF = "Template_V5_XJDF2x.fm";
var TEMPLATE_BOTH = "Template_V5.fm";
var TEMPLATE_PLAIN = "Template_V5.fm";
var TEMPLATE_ICS = "Template_ICS.fm"
var TEMPLATE_ICS_MIS = "Template_ICS_Mis.fm"
var TEMPLATE_ICS_CUS = "Template_ICS_Cus.fm"

var KEY_FILE_BOOK = "file.book";
var KEY_FILE_LOG = "file.logging";
var KEY_DIR_SOURCE = "dir.source";
var KEY_DIR_TARGET = "dir.target";
var KEY_BUILD_FILENAME = "build.filename";
var KEY_BUILD_LAYOUT = "build.layout"

// Configuration variables
var COVER_TITLE = "doc.cover_title"
var COVER_VERSION = "doc.cover_version"
var COVER_BANNER_1 = "doc.cover_banner_1"
var COVER_BANNER_2 = "doc.cover_banner_2"
var RUNNING_TITLE = "doc.running_title"
// And the variable names in all templates
var COVER_TITLE_NAME = "Cover Title"
var COVER_VERSION_NAME = "Cover Version"
var COVER_BANNER_1_NAME = "Cover Banner 1"
var COVER_BANNER_2_NAME = "Cover Banner 2"
var RUNNING_TITLE_NAME = "Running Title"


// !! ATTENTION !!
// !! The following two lines are being overwritten by the python script. DON'T MODIFY !!
log("---- Start Script [TEST-PROCESS] ----");
var FILE_CONFIG = "C:\\Workspace\\spec-builder\\build.test.config";
var PROCESS_ID = "TEST_PROCESS";

log("JSX-Version (ExtendScript): 0.9");

var filename = readConfig(KEY_FILE_BOOK);

log("Load book '" + filename + "'...");
var book = openFile(filename);

log("Update components of book '" + book.Name + "'...");
updateComponents(book);

log("Update book '" + book.Name + "'...");
updateBook(book);

log("Save book '" + book.Name + "' as PDF...");
savePdf(book);

// log("Save book '" + book.Name + "' as HTML...");
// saveHtml(book);

log("Close book...")
book.Close(Constants.FF_CLOSE_MODIFIED);

log("Process completed.");
$.sleep(5000)
File(readConfig(KEY_DIR_TARGET) + PROCESS_ID).remove();


/**
 * Open the book or document.   
 **/
function openFile(filename) {  
    
    var openProps = GetOpenDefaultParams();
    var i = GetPropIndex(openProps, Constants.FS_FileIsOldVersion);  
    openProps[i].propVal.ival = Constants.FV_DoOK;  
  
    // open specification book.  
    log("Open file '" + filename + "'...");
    var file = Open(filename, openProps, new PropVals());  
  
    if (file.ObjectValid () === 1) {  
        // Add a property to the document or book, indicating that the script opened it.  
        file.openedByScript = true; 
        log("File '" + filename + "' has been opened successfully.");
    }  
    else {  
        // If the document can't be open, print the errors to the Console.  
        log("Error during open file '" + filename + "'.");
    }  
  
    return file; 
} 

/**
 * Update all sections of a book.
 **/
function updateComponents(book) {
    // load the one template required for this build layout
    var layout = readConfig(KEY_BUILD_LAYOUT);
    var template;
    if(layout == "XJDF-BLACK") {
        // XJDF 
        template = openFile(readConfig(KEY_DIR_SOURCE) + TEMPLATE_XJDF);
    } else if (layout == "JDF-BLACK") {
        // JDF
        template = openFile(readConfig(KEY_DIR_SOURCE) + TEMPLATE_JDF);
    } else if (layout == "BOTH-COLORED") {
        // Both
        template = openFile(readConfig(KEY_DIR_SOURCE) + TEMPLATE_BOTH);
    } else if (layout == "PLAIN") {
        // Plain - i.e. unversioned
        template = openFile(readConfig(KEY_DIR_SOURCE) + TEMPLATE_PLAIN);
    } else if (layout == "ICS") {
        // ICS - unversioned
        template = openFile(readConfig(KEY_DIR_SOURCE) + TEMPLATE_ICS);
    } else if (layout == "ICSMIS") {
        // ICS - unversioned
        template = openFile(readConfig(KEY_DIR_SOURCE) + TEMPLATE_ICS_MIS);
    } else if (layout == "ICSCUS") {
        // ICS - unversioned
        template = openFile(readConfig(KEY_DIR_SOURCE) + TEMPLATE_ICS_CUS);
    } else {
      return; // No valid template
    }
    
    log("Template used: " + template.Name);
    // Change the variables in the template to reflect this build
    updateTemplate(template);
    
    // Select which options of the template should be applied to all documents.
    // For plain builds this is just the variables.
    var formatFlags;
    if (layout == "PLAIN") {
        // Plain - i.e. unversioned
        formatFlags = Constants.FF_UFF_VAR;     // Variables
    } else {
        // Versioned 
        formatFlags = Constants.FF_UFF_COND	|	// Conditional Text Settings
                      Constants.FF_UFF_FONT |   // Character Formats
                      Constants.FF_UFF_VAR;     // Variables
    }

    // Update all documents in the book
    // iterate over all book components
    var component = book.FirstComponentInBook;    
    while(component.id) {
        // load document
        file = openFile(component.Name);

        log("Apply Template to '" + component.Name + "'");
        file.SimpleImportFormats(template, formatFlags);
    
        // save and close 
        file.Save(component.Name, GetSaveDefaultParams(), new PropVals());
        log("Component '" + component.Name + "' has been saved.");
        
        file.Close(Constants.FF_CLOSE_MODIFIED);     
        log("Component '" + component.Name + "' has been closed.");
        
        // next component
        component = component.NextComponentInBook;
    }

    // Close the template - no longer required. Don't save any changes
    template.Close(Constants.FF_CLOSE_MODIFIED);
}

/**
 * Update references etc. in the book.
 **/
function updateBook(book) {
	var params = GetUpdateBookDefaultParams();
    var updateReturnParams = new PropVals();
	
	var i = GetPropIndex(params, Constants.FS_AlertUserAboutFailure);  
    params[i].propVal.ival = true; 
	
	var i = GetPropIndex(params, Constants.FS_AllowInconsistentNumProps);  
    params[i].propVal.ival = Constants.FV_DoOK;
	
	var i = GetPropIndex(params, Constants.FS_AllowNonFMFiles);  
    params[i].propVal.ival = Constants.FV_DoShowDialog;
	
	var i = GetPropIndex(params, Constants.FS_AllowViewOnlyFiles);  
    params[i].propVal.ival = Constants.FV_DoShowDialog;
	
	var i = GetPropIndex(params, Constants.FS_MakeVisible);  
    params[i].propVal.ival = true;
	
	var i = GetPropIndex(params, Constants.FS_ShowBookErrorLog);  
    params[i].propVal.ival = true;
	
	var i = GetPropIndex(params, Constants.FS_UpdateBookGeneratedFiles);  
    params[i].propVal.ival = true;
	
	var i = GetPropIndex(params, Constants.FS_UpdateBookMasterPages);  
    params[i].propVal.ival = false;
	
	var i = GetPropIndex(params, Constants.FS_UpdateBookNumbering);  
    params[i].propVal.ival = true;
	
	var i = GetPropIndex(params, Constants.FS_UpdateBookOleLinks);  
    params[i].propVal.ival = true;
    
    var i = GetPropIndex(params, Constants.FS_UpdateBookTextReferences);
    params[i].propVal.ival = true;
	
    var i = GetPropIndex(params, Constants.FS_UpdateBookXRefs);
    params[i].propVal.ival = true;

	var returnValue = book.UpdateBook(params, updateReturnParams);
    
	// log values
	log("Book update completed. ReturnValue: " + returnValue);
	log("Number of ReturnParams: " + updateReturnParams.length)
	
	for(var n = 0; n < updateReturnParams.length; n ++) {
		log("Update Result: " + updateReturnParams[n].propIdent.name + " - " + updateReturnParams[n].propVal.sval + "(" + updateReturnParams[n].propVal.ival + ")");
	}
}

/**
 * Modify the template.
 */
function updateTemplate(tpl) {
    
    // Change the template variables if the configuration file has new values
    // Otherwise use the values from the template - default to adding the variables with an empty value
    setVariable(tpl, COVER_TITLE_NAME, readConfig(COVER_TITLE));
    setVariable(tpl, COVER_VERSION_NAME, readConfig(COVER_VERSION));
    setVariable(tpl, COVER_BANNER_1_NAME, readConfig(COVER_BANNER_1));
    setVariable(tpl, COVER_BANNER_2_NAME, readConfig(COVER_BANNER_2));
    setVariable(tpl, RUNNING_TITLE_NAME, readConfig(RUNNING_TITLE));
}

/**
 * Change or add a variable
 **/
function setVariable(doc, name, value) {
    var varFmt = doc.GetNamedVarFmt(name);
    if (varFmt.Name == null) {
        // Create a new variable
        varFmt = doc.NewNamedVarFmt(name);
        varFmt.Fmt = "";
    }
    if (value != "") {
        varFmt.Fmt = value;
    }
}

/**
 * Save as PDF.
 **/
function savePdf(book) {
    var params = GetSaveDefaultParams();
    var returnParamsp = new PropVals();

    var i = GetPropIndex(params, Constants.FS_FileType);
    params[i].propVal.ival = Constants.FV_SaveFmtPdf;

    var path = readConfig(KEY_DIR_TARGET) + readConfig(KEY_BUILD_FILENAME) + ".pdf";
    log("Write PDF to '" + path + "'");
    book.Save(path, params, returnParamsp);
}

/**
 * Save as HTML.
 **/
function saveHtml(book) {
    var params = GetSaveDefaultParams();
    var returnParamsp = new PropVals();

    var i = GetPropIndex(params, Constants.FS_FileType);
    params[i].propVal.ival = Constants.FV_SaveFmtFilter;
    
    var i = GetPropIndex(params, Constants.FS_SaveFileTypeHint);  
    params[i].propVal.sval = "0001ADBEHTML";

    var folderHtml = new Folder(readConfig(KEY_DIR_TARGET) + "\\html\\");  
    folderHtml.create();

    var path = readConfig(KEY_DIR_TARGET) + "html\\index.htm";
    log("Write HTML files...");
    book.Save(path, params, returnParamsp);
}

/**
 * Read configuration by key.
 **/
function readConfig(key) {
    
    var result = undefined;
    var file = File(FILE_CONFIG);
    
    file.open("r");
    while (!file.eof) {
        line = file.readln();
        
        if(line.indexOf(key + "=") == 0) {
            result = line.split("=")[1];
        }
    }
    file.close();

    return result;
}

/**
 * Log a message.
 **/
function log(message) {
    var logFile = File(readConfig(KEY_FILE_LOG));
    
    // create timestamp string
    var timestamp = "";
    var now = new Date();
    
    timestamp += now.getFullYear() + "-";
    timestamp += pad(now.getMonth() + 1, 2) + "-";
    timestamp += pad(now.getDate(), 2);
    timestamp += " ";
    timestamp += pad(now.getHours(), 2) + ":";
    timestamp += pad(now.getMinutes(), 2) + ":";
    timestamp += pad(now.getSeconds(), 2) + ".";
    timestamp += pad(now.getMilliseconds(), 3);
    
    // create line
    var line = timestamp + " - " + message
    
    
    // log line
    logFile.open("a");
    logFile.writeln(line);
    logFile.close();
}

/**
 * Fill up with leading zeros.
 **/
function pad(value, digits) {
    var result = String(value) ;
    
    while(digits > result.length) {
        result = '0' + result ;
    }
  
    return result ;
}


