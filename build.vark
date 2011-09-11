uses java.io.File
uses java.lang.System
uses gw.vark.Aardvark
uses org.apache.tools.ant.types.Path

function build() {
  var classesDir = file("build/classes")
  classesDir.mkdirs()
  Ant.copy(:filesetList = {file("src").fileset() },
           :todir = classesDir)
  Ant.jar(:destfile = file("build/roninWS.jar"),
          :manifest = file("src/META-INF/MANIFEST.MF").exists() ? file("src/META-INF/MANIFEST.MF") : null,
          :basedir = classesDir)
}