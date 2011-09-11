package ronin.ws

uses java.util.*

uses javax.servlet.*
uses javax.servlet.http.*

uses gw.lang.reflect.*
uses gw.lang.reflect.features.*
uses gw.lang.reflect.gs.*

class RoninWebservicesFilter implements Filter {

  var _wsWrapper : IWSWrapper

  override function init(config : FilterConfig) {
    _wsWrapper = initWrapper()
    for(t in findWebservices()) {
      _wsWrapper?.addWebService(t.Name)
    }
  }

  override function destroy() {}

  override function doFilter(req : ServletRequest, resp : ServletResponse, chain : FilterChain) {
    if(req typeis HttpServletRequest and resp typeis HttpServletResponse and handles(req)) {
      handle(req, resp)
    } else {
      chain.doFilter(req, resp)
    }
  }

  /**
   * Registers all classes in the 'webservices' package that have the correct @WSIWebservice annotation
   * as webservices
   */
  function findWebservices() : List<IType> {
    var lst = new ArrayList<IType>()
    var loader = TypeSystem.getTypeLoader( GosuClassTypeLoader )
    for( name in loader.AllTypeNames ) {
      if( name.toString().startsWith( "webservices." ) ) {
        lst.add( TypeSystem.getByFullName( name.toString() ) )
      }
    }
    return lst
  }

  function handles(req : HttpServletRequest) : boolean {
    return req?.PathInfo?.startsWith("/webservices") or
           req?.PathInfo?.startsWith("/resources.dftree/")
  }

  function handle(req : HttpServletRequest, resp : HttpServletResponse) {
    if (_wsWrapper == null) {
      throw "Webservices are not supported without the Gosu webservices jars"
    }
    if (req?.PathInfo == "/webservices") {
      var contextPath = req.ContextPath
      if( not contextPath.startsWith( "/" ) ) {
        contextPath = "/" + contextPath
      }
      _wsWrapper.listServices(resp, contextPath)
    } else {
      _wsWrapper.service(req, resp);
    }
  }

  final function initWrapper() : IWSWrapper {
    var wrapperType = gw.lang.reflect.TypeSystem.getByFullNameIfValid( "ronin.ws.WSWrapper" )
    if(wrapperType != null) {
      return wrapperType.TypeInfo.getConstructor( {} ).Constructor.newInstance( {} ) as IWSWrapper
    } else {
      return null
    }
  }

}