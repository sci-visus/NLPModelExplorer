'''Wrapper for gurobi_c.h

Generated with:
ctypesgen.py -lgurobi /opt/gurobi702/linux64/include/gurobi_c.h -o gurobi.py

Do not modify this file.
'''

__docformat__ =  'restructuredtext'

# Begin preamble

import ctypes, os, sys
from ctypes import *

_int_types = (c_int16, c_int32)
if hasattr(ctypes, 'c_int64'):
    # Some builds of ctypes apparently do not have c_int64
    # defined; it's a pretty good bet that these builds do not
    # have 64-bit pointers.
    _int_types += (c_int64,)
for t in _int_types:
    if sizeof(t) == sizeof(c_size_t):
        c_ptrdiff_t = t
del t
del _int_types

class c_void(Structure):
    # c_void_p is a buggy return type, converting to int, so
    # POINTER(None) == c_void_p is actually written as
    # POINTER(c_void), so it can be treated as a real pointer.
    _fields_ = [('dummy', c_int)]

def POINTER(obj):
    p = ctypes.POINTER(obj)

    # Convert None to a real NULL pointer to work around bugs
    # in how ctypes handles None on 64-bit platforms
    if not isinstance(p.from_param, classmethod):
        def from_param(cls, x):
            if x is None:
                return cls()
            else:
                return x
        p.from_param = classmethod(from_param)

    return p

class UserString:
    def __init__(self, seq):
        if isinstance(seq, basestring):
            self.data = seq
        elif isinstance(seq, UserString):
            self.data = seq.data[:]
        else:
            self.data = str(seq)
    def __str__(self): return str(self.data)
    def __repr__(self): return repr(self.data)
    def __int__(self): return int(self.data)
    def __long__(self): return long(self.data)
    def __float__(self): return float(self.data)
    def __complex__(self): return complex(self.data)
    def __hash__(self): return hash(self.data)

    def __cmp__(self, string):
        if isinstance(string, UserString):
            return cmp(self.data, string.data)
        else:
            return cmp(self.data, string)
    def __contains__(self, char):
        return char in self.data

    def __len__(self): return len(self.data)
    def __getitem__(self, index): return self.__class__(self.data[index])
    def __getslice__(self, start, end):
        start = max(start, 0); end = max(end, 0)
        return self.__class__(self.data[start:end])

    def __add__(self, other):
        if isinstance(other, UserString):
            return self.__class__(self.data + other.data)
        elif isinstance(other, basestring):
            return self.__class__(self.data + other)
        else:
            return self.__class__(self.data + str(other))
    def __radd__(self, other):
        if isinstance(other, basestring):
            return self.__class__(other + self.data)
        else:
            return self.__class__(str(other) + self.data)
    def __mul__(self, n):
        return self.__class__(self.data*n)
    __rmul__ = __mul__
    def __mod__(self, args):
        return self.__class__(self.data % args)

    # the following methods are defined in alphabetical order:
    def capitalize(self): return self.__class__(self.data.capitalize())
    def center(self, width, *args):
        return self.__class__(self.data.center(width, *args))
    def count(self, sub, start=0, end=sys.maxint):
        return self.data.count(sub, start, end)
    def decode(self, encoding=None, errors=None): # XXX improve this?
        if encoding:
            if errors:
                return self.__class__(self.data.decode(encoding, errors))
            else:
                return self.__class__(self.data.decode(encoding))
        else:
            return self.__class__(self.data.decode())
    def encode(self, encoding=None, errors=None): # XXX improve this?
        if encoding:
            if errors:
                return self.__class__(self.data.encode(encoding, errors))
            else:
                return self.__class__(self.data.encode(encoding))
        else:
            return self.__class__(self.data.encode())
    def endswith(self, suffix, start=0, end=sys.maxint):
        return self.data.endswith(suffix, start, end)
    def expandtabs(self, tabsize=8):
        return self.__class__(self.data.expandtabs(tabsize))
    def find(self, sub, start=0, end=sys.maxint):
        return self.data.find(sub, start, end)
    def index(self, sub, start=0, end=sys.maxint):
        return self.data.index(sub, start, end)
    def isalpha(self): return self.data.isalpha()
    def isalnum(self): return self.data.isalnum()
    def isdecimal(self): return self.data.isdecimal()
    def isdigit(self): return self.data.isdigit()
    def islower(self): return self.data.islower()
    def isnumeric(self): return self.data.isnumeric()
    def isspace(self): return self.data.isspace()
    def istitle(self): return self.data.istitle()
    def isupper(self): return self.data.isupper()
    def join(self, seq): return self.data.join(seq)
    def ljust(self, width, *args):
        return self.__class__(self.data.ljust(width, *args))
    def lower(self): return self.__class__(self.data.lower())
    def lstrip(self, chars=None): return self.__class__(self.data.lstrip(chars))
    def partition(self, sep):
        return self.data.partition(sep)
    def replace(self, old, new, maxsplit=-1):
        return self.__class__(self.data.replace(old, new, maxsplit))
    def rfind(self, sub, start=0, end=sys.maxint):
        return self.data.rfind(sub, start, end)
    def rindex(self, sub, start=0, end=sys.maxint):
        return self.data.rindex(sub, start, end)
    def rjust(self, width, *args):
        return self.__class__(self.data.rjust(width, *args))
    def rpartition(self, sep):
        return self.data.rpartition(sep)
    def rstrip(self, chars=None): return self.__class__(self.data.rstrip(chars))
    def split(self, sep=None, maxsplit=-1):
        return self.data.split(sep, maxsplit)
    def rsplit(self, sep=None, maxsplit=-1):
        return self.data.rsplit(sep, maxsplit)
    def splitlines(self, keepends=0): return self.data.splitlines(keepends)
    def startswith(self, prefix, start=0, end=sys.maxint):
        return self.data.startswith(prefix, start, end)
    def strip(self, chars=None): return self.__class__(self.data.strip(chars))
    def swapcase(self): return self.__class__(self.data.swapcase())
    def title(self): return self.__class__(self.data.title())
    def translate(self, *args):
        return self.__class__(self.data.translate(*args))
    def upper(self): return self.__class__(self.data.upper())
    def zfill(self, width): return self.__class__(self.data.zfill(width))

class MutableString(UserString):
    """mutable string objects

    Python strings are immutable objects.  This has the advantage, that
    strings may be used as dictionary keys.  If this property isn't needed
    and you insist on changing string values in place instead, you may cheat
    and use MutableString.

    But the purpose of this class is an educational one: to prevent
    people from inventing their own mutable string class derived
    from UserString and than forget thereby to remove (override) the
    __hash__ method inherited from UserString.  This would lead to
    errors that would be very hard to track down.

    A faster and better solution is to rewrite your program using lists."""
    def __init__(self, string=""):
        self.data = string
    def __hash__(self):
        raise TypeError("unhashable type (it is mutable)")
    def __setitem__(self, index, sub):
        if index < 0:
            index += len(self.data)
        if index < 0 or index >= len(self.data): raise IndexError
        self.data = self.data[:index] + sub + self.data[index+1:]
    def __delitem__(self, index):
        if index < 0:
            index += len(self.data)
        if index < 0 or index >= len(self.data): raise IndexError
        self.data = self.data[:index] + self.data[index+1:]
    def __setslice__(self, start, end, sub):
        start = max(start, 0); end = max(end, 0)
        if isinstance(sub, UserString):
            self.data = self.data[:start]+sub.data+self.data[end:]
        elif isinstance(sub, basestring):
            self.data = self.data[:start]+sub+self.data[end:]
        else:
            self.data =  self.data[:start]+str(sub)+self.data[end:]
    def __delslice__(self, start, end):
        start = max(start, 0); end = max(end, 0)
        self.data = self.data[:start] + self.data[end:]
    def immutable(self):
        return UserString(self.data)
    def __iadd__(self, other):
        if isinstance(other, UserString):
            self.data += other.data
        elif isinstance(other, basestring):
            self.data += other
        else:
            self.data += str(other)
        return self
    def __imul__(self, n):
        self.data *= n
        return self

class String(MutableString, Union):

    _fields_ = [('raw', POINTER(c_char)),
                ('data', c_char_p)]

    def __init__(self, obj=""):
        if isinstance(obj, (str, unicode, UserString)):
            self.data = str(obj)
        else:
            self.raw = obj

    def __len__(self):
        return self.data and len(self.data) or 0

    def from_param(cls, obj):
        # Convert None or 0
        if obj is None or obj == 0:
            return cls(POINTER(c_char)())

        # Convert from String
        elif isinstance(obj, String):
            return obj

        # Convert from str
        elif isinstance(obj, str):
            return cls(obj)

        # Convert from c_char_p
        elif isinstance(obj, c_char_p):
            return obj

        # Convert from POINTER(c_char)
        elif isinstance(obj, POINTER(c_char)):
            return obj

        # Convert from raw pointer
        elif isinstance(obj, int):
            return cls(cast(obj, POINTER(c_char)))

        # Convert from object
        else:
            return String.from_param(obj._as_parameter_)
    from_param = classmethod(from_param)

def ReturnString(obj, func=None, arguments=None):
    return String.from_param(obj)

# As of ctypes 1.0, ctypes does not support custom error-checking
# functions on callbacks, nor does it support custom datatypes on
# callbacks, so we must ensure that all callbacks return
# primitive datatypes.
#
# Non-primitive return values wrapped with UNCHECKED won't be
# typechecked, and will be converted to c_void_p.
def UNCHECKED(type):
    if (hasattr(type, "_type_") and isinstance(type._type_, str)
        and type._type_ != "P"):
        return type
    else:
        return c_void_p

# ctypes doesn't have direct support for variadic functions, so we have to write
# our own wrapper class
class _variadic_function(object):
    def __init__(self,func,restype,argtypes):
        self.func=func
        self.func.restype=restype
        self.argtypes=argtypes
    def _as_parameter_(self):
        # So we can pass this variadic function as a function pointer
        return self.func
    def __call__(self,*args):
        fixed_args=[]
        i=0
        for argtype in self.argtypes:
            # Typecheck what we can
            fixed_args.append(argtype.from_param(args[i]))
            i+=1
        return self.func(*fixed_args+list(args[i:]))

# End preamble

_libs = {}
_libdirs = []

# Begin loader

# ----------------------------------------------------------------------------
# Copyright (c) 2008 David James
# Copyright (c) 2006-2008 Alex Holkner
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
#
#  * Redistributions of source code must retain the above copyright
#    notice, this list of conditions and the following disclaimer.
#  * Redistributions in binary form must reproduce the above copyright
#    notice, this list of conditions and the following disclaimer in
#    the documentation and/or other materials provided with the
#    distribution.
#  * Neither the name of pyglet nor the names of its
#    contributors may be used to endorse or promote products
#    derived from this software without specific prior written
#    permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
# FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
# COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
# INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
# BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
# LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
# ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
# ----------------------------------------------------------------------------

import os.path, re, sys, glob
import platform
import ctypes
import ctypes.util

def _environ_path(name):
    if name in os.environ:
        return os.environ[name].split(":")
    else:
        return []

class LibraryLoader(object):
    def __init__(self):
        self.other_dirs=[]

    def load_library(self,libname):
        """Given the name of a library, load it."""
        paths = self.getpaths(libname)

        for path in paths:
            if os.path.exists(path):
                return self.load(path)

        raise ImportError("%s not found." % libname)

    def load(self,path):
        """Given a path to a library, load it."""
        try:
            # Darwin requires dlopen to be called with mode RTLD_GLOBAL instead
            # of the default RTLD_LOCAL.  Without this, you end up with
            # libraries not being loadable, resulting in "Symbol not found"
            # errors
            if sys.platform == 'darwin':
                return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)
            else:
                return ctypes.cdll.LoadLibrary(path)
        except OSError,e:
            raise ImportError(e)

    def getpaths(self,libname):
        """Return a list of paths where the library might be found."""
        if os.path.isabs(libname):
            yield libname
        else:
            # FIXME / TODO return '.' and os.path.dirname(__file__)
            for path in self.getplatformpaths(libname):
                yield path

            path = ctypes.util.find_library(libname)
            if path: yield path

    def getplatformpaths(self, libname):
        return []

# Darwin (Mac OS X)

class DarwinLibraryLoader(LibraryLoader):
    name_formats = ["lib%s.dylib", "lib%s.so", "lib%s.bundle", "%s.dylib",
                "%s.so", "%s.bundle", "%s"]

    def getplatformpaths(self,libname):
        if os.path.pathsep in libname:
            names = [libname]
        else:
            names = [format % libname for format in self.name_formats]

        for dir in self.getdirs(libname):
            for name in names:
                yield os.path.join(dir,name)

    def getdirs(self,libname):
        '''Implements the dylib search as specified in Apple documentation:

        http://developer.apple.com/documentation/DeveloperTools/Conceptual/
            DynamicLibraries/Articles/DynamicLibraryUsageGuidelines.html

        Before commencing the standard search, the method first checks
        the bundle's ``Frameworks`` directory if the application is running
        within a bundle (OS X .app).
        '''

        dyld_fallback_library_path = _environ_path("DYLD_FALLBACK_LIBRARY_PATH")
        if not dyld_fallback_library_path:
            dyld_fallback_library_path = [os.path.expanduser('~/lib'),
                                          '/usr/local/lib', '/usr/lib']

        dirs = []

        if '/' in libname:
            dirs.extend(_environ_path("DYLD_LIBRARY_PATH"))
        else:
            dirs.extend(_environ_path("LD_LIBRARY_PATH"))
            dirs.extend(_environ_path("DYLD_LIBRARY_PATH"))

        dirs.extend(self.other_dirs)
        dirs.append(".")
        dirs.append(os.path.dirname(__file__))

        if hasattr(sys, 'frozen') and sys.frozen == 'macosx_app':
            dirs.append(os.path.join(
                os.environ['RESOURCEPATH'],
                '..',
                'Frameworks'))

        dirs.extend(dyld_fallback_library_path)

        return dirs

# Posix

class PosixLibraryLoader(LibraryLoader):
    _ld_so_cache = None

    def _create_ld_so_cache(self):
        # Recreate search path followed by ld.so.  This is going to be
        # slow to build, and incorrect (ld.so uses ld.so.cache, which may
        # not be up-to-date).  Used only as fallback for distros without
        # /sbin/ldconfig.
        #
        # We assume the DT_RPATH and DT_RUNPATH binary sections are omitted.

        directories = []
        for name in ("LD_LIBRARY_PATH",
                     "SHLIB_PATH", # HPUX
                     "LIBPATH", # OS/2, AIX
                     "LIBRARY_PATH", # BE/OS
                    ):
            if name in os.environ:
                directories.extend(os.environ[name].split(os.pathsep))
        directories.extend(self.other_dirs)
        directories.append(".")
        directories.append(os.path.dirname(__file__))

        try: directories.extend([dir.strip() for dir in open('/etc/ld.so.conf')])
        except IOError: pass

        unix_lib_dirs_list = ['/lib', '/usr/lib', '/lib64', '/usr/lib64']
        if sys.platform.startswith('linux'):
            # Try and support multiarch work in Ubuntu
            # https://wiki.ubuntu.com/MultiarchSpec
            bitage = platform.architecture()[0]
            if bitage.startswith('32'):
                # Assume Intel/AMD x86 compat
                unix_lib_dirs_list += ['/lib/i386-linux-gnu', '/usr/lib/i386-linux-gnu']
            elif bitage.startswith('64'):
                # Assume Intel/AMD x86 compat
                unix_lib_dirs_list += ['/lib/x86_64-linux-gnu', '/usr/lib/x86_64-linux-gnu']
            else:
                # guess...
                unix_lib_dirs_list += glob.glob('/lib/*linux-gnu')
        directories.extend(unix_lib_dirs_list)

        cache = {}
        lib_re = re.compile(r'lib(.*)\.s[ol]')
        ext_re = re.compile(r'\.s[ol]$')
        for dir in directories:
            try:
                for path in glob.glob("%s/*.s[ol]*" % dir):
                    file = os.path.basename(path)

                    # Index by filename
                    if file not in cache:
                        cache[file] = path

                    # Index by library name
                    match = lib_re.match(file)
                    if match:
                        library = match.group(1)
                        if library not in cache:
                            cache[library] = path
            except OSError:
                pass

        self._ld_so_cache = cache

    def getplatformpaths(self, libname):
        if self._ld_so_cache is None:
            self._create_ld_so_cache()

        result = self._ld_so_cache.get(libname)
        if result: yield result

        path = ctypes.util.find_library(libname)
        if path: yield os.path.join("/lib",path)

# Windows

class _WindowsLibrary(object):
    def __init__(self, path):
        self.cdll = ctypes.cdll.LoadLibrary(path)
        self.windll = ctypes.windll.LoadLibrary(path)

    def __getattr__(self, name):
        try: return getattr(self.cdll,name)
        except AttributeError:
            try: return getattr(self.windll,name)
            except AttributeError:
                raise

class WindowsLibraryLoader(LibraryLoader):
    name_formats = ["%s.dll", "lib%s.dll", "%slib.dll"]

    def load_library(self, libname):
        try:
            result = LibraryLoader.load_library(self, libname)
        except ImportError:
            result = None
            if os.path.sep not in libname:
                for name in self.name_formats:
                    try:
                        result = getattr(ctypes.cdll, name % libname)
                        if result:
                            break
                    except WindowsError:
                        result = None
            if result is None:
                try:
                    result = getattr(ctypes.cdll, libname)
                except WindowsError:
                    result = None
            if result is None:
                raise ImportError("%s not found." % libname)
        return result

    def load(self, path):
        return _WindowsLibrary(path)

    def getplatformpaths(self, libname):
        if os.path.sep not in libname:
            for name in self.name_formats:
                dll_in_current_dir = os.path.abspath(name % libname)
                if os.path.exists(dll_in_current_dir):
                    yield dll_in_current_dir
                path = ctypes.util.find_library(name % libname)
                if path:
                    yield path

# Platform switching

# If your value of sys.platform does not appear in this dict, please contact
# the Ctypesgen maintainers.

loaderclass = {
    "darwin":   DarwinLibraryLoader,
    "cygwin":   WindowsLibraryLoader,
    "win32":    WindowsLibraryLoader
}

loader = loaderclass.get(sys.platform, PosixLibraryLoader)()

def add_library_search_dirs(other_dirs):
    loader.other_dirs = other_dirs

load_library = loader.load_library

del loaderclass

# End loader

add_library_search_dirs([])

# Begin libraries

_libs["gurobi"] = load_library("gurobi")

# 1 libraries
# End libraries

# No modules

__off_t = c_long # /usr/include/x86_64-linux-gnu/bits/types.h: 131

__off64_t = c_long # /usr/include/x86_64-linux-gnu/bits/types.h: 132

# /usr/include/libio.h: 241
class struct__IO_FILE(Structure):
    pass

FILE = struct__IO_FILE # /usr/include/stdio.h: 48

_IO_lock_t = None # /usr/include/libio.h: 150

# /usr/include/libio.h: 156
class struct__IO_marker(Structure):
    pass

struct__IO_marker.__slots__ = [
    '_next',
    '_sbuf',
    '_pos',
]
struct__IO_marker._fields_ = [
    ('_next', POINTER(struct__IO_marker)),
    ('_sbuf', POINTER(struct__IO_FILE)),
    ('_pos', c_int),
]

struct__IO_FILE.__slots__ = [
    '_flags',
    '_IO_read_ptr',
    '_IO_read_end',
    '_IO_read_base',
    '_IO_write_base',
    '_IO_write_ptr',
    '_IO_write_end',
    '_IO_buf_base',
    '_IO_buf_end',
    '_IO_save_base',
    '_IO_backup_base',
    '_IO_save_end',
    '_markers',
    '_chain',
    '_fileno',
    '_flags2',
    '_old_offset',
    '_cur_column',
    '_vtable_offset',
    '_shortbuf',
    '_lock',
    '_offset',
    '__pad1',
    '__pad2',
    '__pad3',
    '__pad4',
    '__pad5',
    '_mode',
    '_unused2',
]
struct__IO_FILE._fields_ = [
    ('_flags', c_int),
    ('_IO_read_ptr', String),
    ('_IO_read_end', String),
    ('_IO_read_base', String),
    ('_IO_write_base', String),
    ('_IO_write_ptr', String),
    ('_IO_write_end', String),
    ('_IO_buf_base', String),
    ('_IO_buf_end', String),
    ('_IO_save_base', String),
    ('_IO_backup_base', String),
    ('_IO_save_end', String),
    ('_markers', POINTER(struct__IO_marker)),
    ('_chain', POINTER(struct__IO_FILE)),
    ('_fileno', c_int),
    ('_flags2', c_int),
    ('_old_offset', __off_t),
    ('_cur_column', c_ushort),
    ('_vtable_offset', c_char),
    ('_shortbuf', c_char * 1),
    ('_lock', POINTER(_IO_lock_t)),
    ('_offset', __off64_t),
    ('__pad1', POINTER(None)),
    ('__pad2', POINTER(None)),
    ('__pad3', POINTER(None)),
    ('__pad4', POINTER(None)),
    ('__pad5', c_size_t),
    ('_mode', c_int),
    ('_unused2', c_char * (((15 * sizeof(c_int)) - (4 * sizeof(POINTER(None)))) - sizeof(c_size_t))),
]

# /opt/gurobi702/linux64/include/gurobi_c.h: 8
class struct__GRBmodel(Structure):
    pass

GRBmodel = struct__GRBmodel # /opt/gurobi702/linux64/include/gurobi_c.h: 8

# /opt/gurobi702/linux64/include/gurobi_c.h: 9
class struct__GRBenv(Structure):
    pass

GRBenv = struct__GRBenv # /opt/gurobi702/linux64/include/gurobi_c.h: 9

# /opt/gurobi702/linux64/include/gurobi_c.h: 111
if hasattr(_libs['gurobi'], 'GRBgetattrinfo'):
    GRBgetattrinfo = _libs['gurobi'].GRBgetattrinfo
    GRBgetattrinfo.argtypes = [POINTER(GRBmodel), String, POINTER(c_int), POINTER(c_int), POINTER(c_int)]
    GRBgetattrinfo.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 114
if hasattr(_libs['gurobi'], 'GRBisattravailable'):
    GRBisattravailable = _libs['gurobi'].GRBisattravailable
    GRBisattravailable.argtypes = [POINTER(GRBmodel), String]
    GRBisattravailable.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 116
if hasattr(_libs['gurobi'], 'GRBgetintattr'):
    GRBgetintattr = _libs['gurobi'].GRBgetintattr
    GRBgetintattr.argtypes = [POINTER(GRBmodel), String, POINTER(c_int)]
    GRBgetintattr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 118
if hasattr(_libs['gurobi'], 'GRBsetintattr'):
    GRBsetintattr = _libs['gurobi'].GRBsetintattr
    GRBsetintattr.argtypes = [POINTER(GRBmodel), String, c_int]
    GRBsetintattr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 120
if hasattr(_libs['gurobi'], 'GRBgetintattrelement'):
    GRBgetintattrelement = _libs['gurobi'].GRBgetintattrelement
    GRBgetintattrelement.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int)]
    GRBgetintattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 123
if hasattr(_libs['gurobi'], 'GRBsetintattrelement'):
    GRBsetintattrelement = _libs['gurobi'].GRBsetintattrelement
    GRBsetintattrelement.argtypes = [POINTER(GRBmodel), String, c_int, c_int]
    GRBsetintattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 126
if hasattr(_libs['gurobi'], 'GRBgetintattrarray'):
    GRBgetintattrarray = _libs['gurobi'].GRBgetintattrarray
    GRBgetintattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_int)]
    GRBgetintattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 129
if hasattr(_libs['gurobi'], 'GRBsetintattrarray'):
    GRBsetintattrarray = _libs['gurobi'].GRBsetintattrarray
    GRBsetintattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_int)]
    GRBsetintattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 132
if hasattr(_libs['gurobi'], 'GRBgetintattrlist'):
    GRBgetintattrlist = _libs['gurobi'].GRBgetintattrlist
    GRBgetintattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), POINTER(c_int)]
    GRBgetintattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 135
if hasattr(_libs['gurobi'], 'GRBsetintattrlist'):
    GRBsetintattrlist = _libs['gurobi'].GRBsetintattrlist
    GRBsetintattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), POINTER(c_int)]
    GRBsetintattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 138
if hasattr(_libs['gurobi'], 'GRBgetcharattrelement'):
    GRBgetcharattrelement = _libs['gurobi'].GRBgetcharattrelement
    GRBgetcharattrelement.argtypes = [POINTER(GRBmodel), String, c_int, String]
    GRBgetcharattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 141
if hasattr(_libs['gurobi'], 'GRBsetcharattrelement'):
    GRBsetcharattrelement = _libs['gurobi'].GRBsetcharattrelement
    GRBsetcharattrelement.argtypes = [POINTER(GRBmodel), String, c_int, c_char]
    GRBsetcharattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 144
if hasattr(_libs['gurobi'], 'GRBgetcharattrarray'):
    GRBgetcharattrarray = _libs['gurobi'].GRBgetcharattrarray
    GRBgetcharattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, String]
    GRBgetcharattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 147
if hasattr(_libs['gurobi'], 'GRBsetcharattrarray'):
    GRBsetcharattrarray = _libs['gurobi'].GRBsetcharattrarray
    GRBsetcharattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, String]
    GRBsetcharattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 150
if hasattr(_libs['gurobi'], 'GRBgetcharattrlist'):
    GRBgetcharattrlist = _libs['gurobi'].GRBgetcharattrlist
    GRBgetcharattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), String]
    GRBgetcharattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 153
if hasattr(_libs['gurobi'], 'GRBsetcharattrlist'):
    GRBsetcharattrlist = _libs['gurobi'].GRBsetcharattrlist
    GRBsetcharattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), String]
    GRBsetcharattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 156
if hasattr(_libs['gurobi'], 'GRBgetdblattr'):
    GRBgetdblattr = _libs['gurobi'].GRBgetdblattr
    GRBgetdblattr.argtypes = [POINTER(GRBmodel), String, POINTER(c_double)]
    GRBgetdblattr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 158
if hasattr(_libs['gurobi'], 'GRBsetdblattr'):
    GRBsetdblattr = _libs['gurobi'].GRBsetdblattr
    GRBsetdblattr.argtypes = [POINTER(GRBmodel), String, c_double]
    GRBsetdblattr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 160
if hasattr(_libs['gurobi'], 'GRBgetdblattrelement'):
    GRBgetdblattrelement = _libs['gurobi'].GRBgetdblattrelement
    GRBgetdblattrelement.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_double)]
    GRBgetdblattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 163
if hasattr(_libs['gurobi'], 'GRBsetdblattrelement'):
    GRBsetdblattrelement = _libs['gurobi'].GRBsetdblattrelement
    GRBsetdblattrelement.argtypes = [POINTER(GRBmodel), String, c_int, c_double]
    GRBsetdblattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 166
if hasattr(_libs['gurobi'], 'GRBgetdblattrarray'):
    GRBgetdblattrarray = _libs['gurobi'].GRBgetdblattrarray
    GRBgetdblattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_double)]
    GRBgetdblattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 169
if hasattr(_libs['gurobi'], 'GRBsetdblattrarray'):
    GRBsetdblattrarray = _libs['gurobi'].GRBsetdblattrarray
    GRBsetdblattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_double)]
    GRBsetdblattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 172
if hasattr(_libs['gurobi'], 'GRBgetdblattrlist'):
    GRBgetdblattrlist = _libs['gurobi'].GRBgetdblattrlist
    GRBgetdblattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), POINTER(c_double)]
    GRBgetdblattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 175
if hasattr(_libs['gurobi'], 'GRBsetdblattrlist'):
    GRBsetdblattrlist = _libs['gurobi'].GRBsetdblattrlist
    GRBsetdblattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), POINTER(c_double)]
    GRBsetdblattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 178
if hasattr(_libs['gurobi'], 'GRBgetstrattr'):
    GRBgetstrattr = _libs['gurobi'].GRBgetstrattr
    GRBgetstrattr.argtypes = [POINTER(GRBmodel), String, POINTER(POINTER(c_char))]
    GRBgetstrattr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 180
if hasattr(_libs['gurobi'], 'GRBsetstrattr'):
    GRBsetstrattr = _libs['gurobi'].GRBsetstrattr
    GRBsetstrattr.argtypes = [POINTER(GRBmodel), String, String]
    GRBsetstrattr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 182
if hasattr(_libs['gurobi'], 'GRBgetstrattrelement'):
    GRBgetstrattrelement = _libs['gurobi'].GRBgetstrattrelement
    GRBgetstrattrelement.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(POINTER(c_char))]
    GRBgetstrattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 185
if hasattr(_libs['gurobi'], 'GRBsetstrattrelement'):
    GRBsetstrattrelement = _libs['gurobi'].GRBsetstrattrelement
    GRBsetstrattrelement.argtypes = [POINTER(GRBmodel), String, c_int, String]
    GRBsetstrattrelement.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 188
if hasattr(_libs['gurobi'], 'GRBgetstrattrarray'):
    GRBgetstrattrarray = _libs['gurobi'].GRBgetstrattrarray
    GRBgetstrattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(POINTER(c_char))]
    GRBgetstrattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 191
if hasattr(_libs['gurobi'], 'GRBsetstrattrarray'):
    GRBsetstrattrarray = _libs['gurobi'].GRBsetstrattrarray
    GRBsetstrattrarray.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(POINTER(c_char))]
    GRBsetstrattrarray.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 194
if hasattr(_libs['gurobi'], 'GRBgetstrattrlist'):
    GRBgetstrattrlist = _libs['gurobi'].GRBgetstrattrlist
    GRBgetstrattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), POINTER(POINTER(c_char))]
    GRBgetstrattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 197
if hasattr(_libs['gurobi'], 'GRBsetstrattrlist'):
    GRBsetstrattrlist = _libs['gurobi'].GRBsetstrattrlist
    GRBsetstrattrlist.argtypes = [POINTER(GRBmodel), String, c_int, POINTER(c_int), POINTER(POINTER(c_char))]
    GRBsetstrattrlist.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 204
if hasattr(_libs['gurobi'], 'GRBsetcallbackfunc'):
    GRBsetcallbackfunc = _libs['gurobi'].GRBsetcallbackfunc
    GRBsetcallbackfunc.argtypes = [POINTER(GRBmodel), CFUNCTYPE(UNCHECKED(c_int), POINTER(GRBmodel), POINTER(None), c_int, POINTER(None)), POINTER(None)]
    GRBsetcallbackfunc.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 208
if hasattr(_libs['gurobi'], 'GRBgetcallbackfunc'):
    GRBgetcallbackfunc = _libs['gurobi'].GRBgetcallbackfunc
    GRBgetcallbackfunc.argtypes = [POINTER(GRBmodel), POINTER(CFUNCTYPE(UNCHECKED(c_int), POINTER(GRBmodel), POINTER(None), c_int, POINTER(None)))]
    GRBgetcallbackfunc.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 211
if hasattr(_libs['gurobi'], 'GRBsetlogcallbackfunc'):
    GRBsetlogcallbackfunc = _libs['gurobi'].GRBsetlogcallbackfunc
    GRBsetlogcallbackfunc.argtypes = [POINTER(GRBmodel), CFUNCTYPE(UNCHECKED(c_int), String)]
    GRBsetlogcallbackfunc.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 214
if hasattr(_libs['gurobi'], 'GRBsetlogcallbackfuncenv'):
    GRBsetlogcallbackfuncenv = _libs['gurobi'].GRBsetlogcallbackfuncenv
    GRBsetlogcallbackfuncenv.argtypes = [POINTER(GRBenv), CFUNCTYPE(UNCHECKED(c_int), String)]
    GRBsetlogcallbackfuncenv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 217
if hasattr(_libs['gurobi'], 'GRBcbget'):
    GRBcbget = _libs['gurobi'].GRBcbget
    GRBcbget.argtypes = [POINTER(None), c_int, c_int, POINTER(None)]
    GRBcbget.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 219
if hasattr(_libs['gurobi'], 'GRBcbsetparam'):
    GRBcbsetparam = _libs['gurobi'].GRBcbsetparam
    GRBcbsetparam.argtypes = [POINTER(None), String, String]
    GRBcbsetparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 221
if hasattr(_libs['gurobi'], 'GRBcbsolution'):
    GRBcbsolution = _libs['gurobi'].GRBcbsolution
    GRBcbsolution.argtypes = [POINTER(None), POINTER(c_double), POINTER(c_double)]
    GRBcbsolution.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 223
if hasattr(_libs['gurobi'], 'GRBcbcut'):
    GRBcbcut = _libs['gurobi'].GRBcbcut
    GRBcbcut.argtypes = [POINTER(None), c_int, POINTER(c_int), POINTER(c_double), c_char, c_double]
    GRBcbcut.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 226
if hasattr(_libs['gurobi'], 'GRBcblazy'):
    GRBcblazy = _libs['gurobi'].GRBcblazy
    GRBcblazy.argtypes = [POINTER(None), c_int, POINTER(c_int), POINTER(c_double), c_char, c_double]
    GRBcblazy.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 517
if hasattr(_libs['gurobi'], 'GRBgetcoeff'):
    GRBgetcoeff = _libs['gurobi'].GRBgetcoeff
    GRBgetcoeff.argtypes = [POINTER(GRBmodel), c_int, c_int, POINTER(c_double)]
    GRBgetcoeff.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 519
if hasattr(_libs['gurobi'], 'GRBgetconstrs'):
    GRBgetconstrs = _libs['gurobi'].GRBgetconstrs
    GRBgetconstrs.argtypes = [POINTER(GRBmodel), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double), c_int, c_int]
    GRBgetconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 522
if hasattr(_libs['gurobi'], 'GRBXgetconstrs'):
    GRBXgetconstrs = _libs['gurobi'].GRBXgetconstrs
    GRBXgetconstrs.argtypes = [POINTER(GRBmodel), POINTER(c_size_t), POINTER(c_size_t), POINTER(c_int), POINTER(c_double), c_int, c_int]
    GRBXgetconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 525
if hasattr(_libs['gurobi'], 'GRBgetvars'):
    GRBgetvars = _libs['gurobi'].GRBgetvars
    GRBgetvars.argtypes = [POINTER(GRBmodel), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double), c_int, c_int]
    GRBgetvars.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 528
if hasattr(_libs['gurobi'], 'GRBXgetvars'):
    GRBXgetvars = _libs['gurobi'].GRBXgetvars
    GRBXgetvars.argtypes = [POINTER(GRBmodel), POINTER(c_size_t), POINTER(c_size_t), POINTER(c_int), POINTER(c_double), c_int, c_int]
    GRBXgetvars.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 531
if hasattr(_libs['gurobi'], 'GRBgetsos'):
    GRBgetsos = _libs['gurobi'].GRBgetsos
    GRBgetsos.argtypes = [POINTER(GRBmodel), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double), c_int, c_int]
    GRBgetsos.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 534
if hasattr(_libs['gurobi'], 'GRBgetgenconstrMax'):
    GRBgetgenconstrMax = _libs['gurobi'].GRBgetgenconstrMax
    GRBgetgenconstrMax.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBgetgenconstrMax.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 537
if hasattr(_libs['gurobi'], 'GRBgetgenconstrMin'):
    GRBgetgenconstrMin = _libs['gurobi'].GRBgetgenconstrMin
    GRBgetgenconstrMin.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBgetgenconstrMin.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 540
if hasattr(_libs['gurobi'], 'GRBgetgenconstrAbs'):
    GRBgetgenconstrAbs = _libs['gurobi'].GRBgetgenconstrAbs
    GRBgetgenconstrAbs.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int)]
    GRBgetgenconstrAbs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 542
if hasattr(_libs['gurobi'], 'GRBgetgenconstrAnd'):
    GRBgetgenconstrAnd = _libs['gurobi'].GRBgetgenconstrAnd
    GRBgetgenconstrAnd.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_int)]
    GRBgetgenconstrAnd.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 545
if hasattr(_libs['gurobi'], 'GRBgetgenconstrOr'):
    GRBgetgenconstrOr = _libs['gurobi'].GRBgetgenconstrOr
    GRBgetgenconstrOr.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_int)]
    GRBgetgenconstrOr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 548
if hasattr(_libs['gurobi'], 'GRBgetgenconstrIndicator'):
    GRBgetgenconstrIndicator = _libs['gurobi'].GRBgetgenconstrIndicator
    GRBgetgenconstrIndicator.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double), String, POINTER(c_double)]
    GRBgetgenconstrIndicator.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 552
if hasattr(_libs['gurobi'], 'GRBgetq'):
    GRBgetq = _libs['gurobi'].GRBgetq
    GRBgetq.argtypes = [POINTER(GRBmodel), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBgetq.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 554
if hasattr(_libs['gurobi'], 'GRBgetqconstr'):
    GRBgetqconstr = _libs['gurobi'].GRBgetqconstr
    GRBgetqconstr.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_double), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBgetqconstr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 558
if hasattr(_libs['gurobi'], 'GRBgetvarbyname'):
    GRBgetvarbyname = _libs['gurobi'].GRBgetvarbyname
    GRBgetvarbyname.argtypes = [POINTER(GRBmodel), String, POINTER(c_int)]
    GRBgetvarbyname.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 560
if hasattr(_libs['gurobi'], 'GRBgetconstrbyname'):
    GRBgetconstrbyname = _libs['gurobi'].GRBgetconstrbyname
    GRBgetconstrbyname.argtypes = [POINTER(GRBmodel), String, POINTER(c_int)]
    GRBgetconstrbyname.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 562
if hasattr(_libs['gurobi'], 'GRBgetpwlobj'):
    GRBgetpwlobj = _libs['gurobi'].GRBgetpwlobj
    GRBgetpwlobj.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_double), POINTER(c_double)]
    GRBgetpwlobj.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 566
if hasattr(_libs['gurobi'], 'GRBoptimize'):
    GRBoptimize = _libs['gurobi'].GRBoptimize
    GRBoptimize.argtypes = [POINTER(GRBmodel)]
    GRBoptimize.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 568
if hasattr(_libs['gurobi'], 'GRBoptimizeasync'):
    GRBoptimizeasync = _libs['gurobi'].GRBoptimizeasync
    GRBoptimizeasync.argtypes = [POINTER(GRBmodel)]
    GRBoptimizeasync.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 570
if hasattr(_libs['gurobi'], 'GRBcopymodel'):
    GRBcopymodel = _libs['gurobi'].GRBcopymodel
    GRBcopymodel.argtypes = [POINTER(GRBmodel)]
    GRBcopymodel.restype = POINTER(GRBmodel)

# /opt/gurobi702/linux64/include/gurobi_c.h: 572
if hasattr(_libs['gurobi'], 'GRBfixedmodel'):
    GRBfixedmodel = _libs['gurobi'].GRBfixedmodel
    GRBfixedmodel.argtypes = [POINTER(GRBmodel)]
    GRBfixedmodel.restype = POINTER(GRBmodel)

# /opt/gurobi702/linux64/include/gurobi_c.h: 575
if hasattr(_libs['gurobi'], 'GRBfeasrelax'):
    GRBfeasrelax = _libs['gurobi'].GRBfeasrelax
    GRBfeasrelax.argtypes = [POINTER(GRBmodel), c_int, c_int, POINTER(c_double), POINTER(c_double), POINTER(c_double), POINTER(c_double)]
    GRBfeasrelax.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 582
if hasattr(_libs['gurobi'], 'GRBgetcbwhatinfo'):
    GRBgetcbwhatinfo = _libs['gurobi'].GRBgetcbwhatinfo
    GRBgetcbwhatinfo.argtypes = [POINTER(None), c_int, POINTER(c_int), POINTER(c_int)]
    GRBgetcbwhatinfo.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 583
if hasattr(_libs['gurobi'], 'GRBrelaxmodel'):
    GRBrelaxmodel = _libs['gurobi'].GRBrelaxmodel
    GRBrelaxmodel.argtypes = [POINTER(GRBmodel)]
    GRBrelaxmodel.restype = POINTER(GRBmodel)

# /opt/gurobi702/linux64/include/gurobi_c.h: 586
if hasattr(_libs['gurobi'], 'GRBconverttofixed'):
    GRBconverttofixed = _libs['gurobi'].GRBconverttofixed
    GRBconverttofixed.argtypes = [POINTER(GRBmodel)]
    GRBconverttofixed.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 587
if hasattr(_libs['gurobi'], 'GRBpresolvemodel'):
    GRBpresolvemodel = _libs['gurobi'].GRBpresolvemodel
    GRBpresolvemodel.argtypes = [POINTER(GRBmodel)]
    GRBpresolvemodel.restype = POINTER(GRBmodel)

# /opt/gurobi702/linux64/include/gurobi_c.h: 589
if hasattr(_libs['gurobi'], 'GRBiismodel'):
    GRBiismodel = _libs['gurobi'].GRBiismodel
    GRBiismodel.argtypes = [POINTER(GRBmodel)]
    GRBiismodel.restype = POINTER(GRBmodel)

# /opt/gurobi702/linux64/include/gurobi_c.h: 591
if hasattr(_libs['gurobi'], 'GRBfeasibility'):
    GRBfeasibility = _libs['gurobi'].GRBfeasibility
    GRBfeasibility.argtypes = [POINTER(GRBmodel)]
    GRBfeasibility.restype = POINTER(GRBmodel)

# /opt/gurobi702/linux64/include/gurobi_c.h: 593
if hasattr(_libs['gurobi'], 'GRBlinearizemodel'):
    GRBlinearizemodel = _libs['gurobi'].GRBlinearizemodel
    GRBlinearizemodel.argtypes = [POINTER(GRBmodel)]
    GRBlinearizemodel.restype = POINTER(GRBmodel)

# /opt/gurobi702/linux64/include/gurobi_c.h: 604
if hasattr(_libs['gurobi'], 'GRBloadenvsyscb'):
    GRBloadenvsyscb = _libs['gurobi'].GRBloadenvsyscb
    GRBloadenvsyscb.argtypes = [POINTER(POINTER(GRBenv)), String, CFUNCTYPE(UNCHECKED(POINTER(None)), c_size_t, POINTER(None)), CFUNCTYPE(UNCHECKED(POINTER(None)), c_size_t, c_size_t, POINTER(None)), CFUNCTYPE(UNCHECKED(POINTER(None)), POINTER(None), c_size_t, POINTER(None)), CFUNCTYPE(UNCHECKED(None), POINTER(None), POINTER(None)), CFUNCTYPE(UNCHECKED(c_int), POINTER(POINTER(None)), CFUNCTYPE(UNCHECKED(None), POINTER(None)), POINTER(None), POINTER(None)), CFUNCTYPE(UNCHECKED(None), POINTER(None), POINTER(None)), POINTER(None)]
    GRBloadenvsyscb.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 615
if hasattr(_libs['gurobi'], 'GRBreadmodel'):
    GRBreadmodel = _libs['gurobi'].GRBreadmodel
    GRBreadmodel.argtypes = [POINTER(GRBenv), String, POINTER(POINTER(GRBmodel))]
    GRBreadmodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 617
if hasattr(_libs['gurobi'], 'GRBread'):
    GRBread = _libs['gurobi'].GRBread
    GRBread.argtypes = [POINTER(GRBmodel), String]
    GRBread.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 619
if hasattr(_libs['gurobi'], 'GRBwrite'):
    GRBwrite = _libs['gurobi'].GRBwrite
    GRBwrite.argtypes = [POINTER(GRBmodel), String]
    GRBwrite.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 621
if hasattr(_libs['gurobi'], 'GRBismodelfile'):
    GRBismodelfile = _libs['gurobi'].GRBismodelfile
    GRBismodelfile.argtypes = [String]
    GRBismodelfile.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 624
if hasattr(_libs['gurobi'], 'GRBnewmodel'):
    GRBnewmodel = _libs['gurobi'].GRBnewmodel
    GRBnewmodel.argtypes = [POINTER(GRBenv), POINTER(POINTER(GRBmodel)), String, c_int, POINTER(c_double), POINTER(c_double), POINTER(c_double), String, POINTER(POINTER(c_char))]
    GRBnewmodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 629
if hasattr(_libs['gurobi'], 'GRBloadmodel'):
    GRBloadmodel = _libs['gurobi'].GRBloadmodel
    GRBloadmodel.argtypes = [POINTER(GRBenv), POINTER(POINTER(GRBmodel)), String, c_int, c_int, c_int, c_double, POINTER(c_double), String, POINTER(c_double), POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double), POINTER(c_double), POINTER(c_double), String, POINTER(POINTER(c_char)), POINTER(POINTER(c_char))]
    GRBloadmodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 638
if hasattr(_libs['gurobi'], 'GRBXloadmodel'):
    GRBXloadmodel = _libs['gurobi'].GRBXloadmodel
    GRBXloadmodel.argtypes = [POINTER(GRBenv), POINTER(POINTER(GRBmodel)), String, c_int, c_int, c_int, c_double, POINTER(c_double), String, POINTER(c_double), POINTER(c_size_t), POINTER(c_int), POINTER(c_int), POINTER(c_double), POINTER(c_double), POINTER(c_double), String, POINTER(POINTER(c_char)), POINTER(POINTER(c_char))]
    GRBXloadmodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 647
if hasattr(_libs['gurobi'], 'GRBaddvar'):
    GRBaddvar = _libs['gurobi'].GRBaddvar
    GRBaddvar.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_double), c_double, c_double, c_double, c_char, String]
    GRBaddvar.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 651
if hasattr(_libs['gurobi'], 'GRBaddvars'):
    GRBaddvars = _libs['gurobi'].GRBaddvars
    GRBaddvars.argtypes = [POINTER(GRBmodel), c_int, c_int, POINTER(c_int), POINTER(c_int), POINTER(c_double), POINTER(c_double), POINTER(c_double), POINTER(c_double), String, POINTER(POINTER(c_char))]
    GRBaddvars.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 656
if hasattr(_libs['gurobi'], 'GRBXaddvars'):
    GRBXaddvars = _libs['gurobi'].GRBXaddvars
    GRBXaddvars.argtypes = [POINTER(GRBmodel), c_int, c_size_t, POINTER(c_size_t), POINTER(c_int), POINTER(c_double), POINTER(c_double), POINTER(c_double), POINTER(c_double), String, POINTER(POINTER(c_char))]
    GRBXaddvars.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 661
if hasattr(_libs['gurobi'], 'GRBaddconstr'):
    GRBaddconstr = _libs['gurobi'].GRBaddconstr
    GRBaddconstr.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_double), c_char, c_double, String]
    GRBaddconstr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 664
if hasattr(_libs['gurobi'], 'GRBaddconstrs'):
    GRBaddconstrs = _libs['gurobi'].GRBaddconstrs
    GRBaddconstrs.argtypes = [POINTER(GRBmodel), c_int, c_int, POINTER(c_int), POINTER(c_int), POINTER(c_double), String, POINTER(c_double), POINTER(POINTER(c_char))]
    GRBaddconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 668
if hasattr(_libs['gurobi'], 'GRBXaddconstrs'):
    GRBXaddconstrs = _libs['gurobi'].GRBXaddconstrs
    GRBXaddconstrs.argtypes = [POINTER(GRBmodel), c_int, c_size_t, POINTER(c_size_t), POINTER(c_int), POINTER(c_double), String, POINTER(c_double), POINTER(POINTER(c_char))]
    GRBXaddconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 672
if hasattr(_libs['gurobi'], 'GRBaddrangeconstr'):
    GRBaddrangeconstr = _libs['gurobi'].GRBaddrangeconstr
    GRBaddrangeconstr.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_double), c_double, c_double, String]
    GRBaddrangeconstr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 675
if hasattr(_libs['gurobi'], 'GRBaddrangeconstrs'):
    GRBaddrangeconstrs = _libs['gurobi'].GRBaddrangeconstrs
    GRBaddrangeconstrs.argtypes = [POINTER(GRBmodel), c_int, c_int, POINTER(c_int), POINTER(c_int), POINTER(c_double), POINTER(c_double), POINTER(c_double), POINTER(POINTER(c_char))]
    GRBaddrangeconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 679
if hasattr(_libs['gurobi'], 'GRBXaddrangeconstrs'):
    GRBXaddrangeconstrs = _libs['gurobi'].GRBXaddrangeconstrs
    GRBXaddrangeconstrs.argtypes = [POINTER(GRBmodel), c_int, c_size_t, POINTER(c_size_t), POINTER(c_int), POINTER(c_double), POINTER(c_double), POINTER(c_double), POINTER(POINTER(c_char))]
    GRBXaddrangeconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 683
if hasattr(_libs['gurobi'], 'GRBaddsos'):
    GRBaddsos = _libs['gurobi'].GRBaddsos
    GRBaddsos.argtypes = [POINTER(GRBmodel), c_int, c_int, POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBaddsos.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 686
if hasattr(_libs['gurobi'], 'GRBaddgenconstrMax'):
    GRBaddgenconstrMax = _libs['gurobi'].GRBaddgenconstrMax
    GRBaddgenconstrMax.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_int), c_double]
    GRBaddgenconstrMax.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 690
if hasattr(_libs['gurobi'], 'GRBaddgenconstrMin'):
    GRBaddgenconstrMin = _libs['gurobi'].GRBaddgenconstrMin
    GRBaddgenconstrMin.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_int), c_double]
    GRBaddgenconstrMin.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 694
if hasattr(_libs['gurobi'], 'GRBaddgenconstrAbs'):
    GRBaddgenconstrAbs = _libs['gurobi'].GRBaddgenconstrAbs
    GRBaddgenconstrAbs.argtypes = [POINTER(GRBmodel), String, c_int, c_int]
    GRBaddgenconstrAbs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 697
if hasattr(_libs['gurobi'], 'GRBaddgenconstrAnd'):
    GRBaddgenconstrAnd = _libs['gurobi'].GRBaddgenconstrAnd
    GRBaddgenconstrAnd.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_int)]
    GRBaddgenconstrAnd.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 700
if hasattr(_libs['gurobi'], 'GRBaddgenconstrOr'):
    GRBaddgenconstrOr = _libs['gurobi'].GRBaddgenconstrOr
    GRBaddgenconstrOr.argtypes = [POINTER(GRBmodel), String, c_int, c_int, POINTER(c_int)]
    GRBaddgenconstrOr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 703
if hasattr(_libs['gurobi'], 'GRBaddgenconstrIndicator'):
    GRBaddgenconstrIndicator = _libs['gurobi'].GRBaddgenconstrIndicator
    GRBaddgenconstrIndicator.argtypes = [POINTER(GRBmodel), String, c_int, c_int, c_int, POINTER(c_int), POINTER(c_double), c_char, c_double]
    GRBaddgenconstrIndicator.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 707
if hasattr(_libs['gurobi'], 'GRBaddqconstr'):
    GRBaddqconstr = _libs['gurobi'].GRBaddqconstr
    GRBaddqconstr.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_double), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_double), c_char, c_double, String]
    GRBaddqconstr.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 711
if hasattr(_libs['gurobi'], 'GRBaddcone'):
    GRBaddcone = _libs['gurobi'].GRBaddcone
    GRBaddcone.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int)]
    GRBaddcone.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 713
if hasattr(_libs['gurobi'], 'GRBaddqpterms'):
    GRBaddqpterms = _libs['gurobi'].GRBaddqpterms
    GRBaddqpterms.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBaddqpterms.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 716
if hasattr(_libs['gurobi'], 'GRBdelvars'):
    GRBdelvars = _libs['gurobi'].GRBdelvars
    GRBdelvars.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int)]
    GRBdelvars.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 718
if hasattr(_libs['gurobi'], 'GRBdelconstrs'):
    GRBdelconstrs = _libs['gurobi'].GRBdelconstrs
    GRBdelconstrs.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int)]
    GRBdelconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 720
if hasattr(_libs['gurobi'], 'GRBdelsos'):
    GRBdelsos = _libs['gurobi'].GRBdelsos
    GRBdelsos.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int)]
    GRBdelsos.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 722
if hasattr(_libs['gurobi'], 'GRBdelgenconstrs'):
    GRBdelgenconstrs = _libs['gurobi'].GRBdelgenconstrs
    GRBdelgenconstrs.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int)]
    GRBdelgenconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 724
if hasattr(_libs['gurobi'], 'GRBdelqconstrs'):
    GRBdelqconstrs = _libs['gurobi'].GRBdelqconstrs
    GRBdelqconstrs.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int)]
    GRBdelqconstrs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 726
if hasattr(_libs['gurobi'], 'GRBdelq'):
    GRBdelq = _libs['gurobi'].GRBdelq
    GRBdelq.argtypes = [POINTER(GRBmodel)]
    GRBdelq.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 728
if hasattr(_libs['gurobi'], 'GRBchgcoeffs'):
    GRBchgcoeffs = _libs['gurobi'].GRBchgcoeffs
    GRBchgcoeffs.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBchgcoeffs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 730
if hasattr(_libs['gurobi'], 'GRBXchgcoeffs'):
    GRBXchgcoeffs = _libs['gurobi'].GRBXchgcoeffs
    GRBXchgcoeffs.argtypes = [POINTER(GRBmodel), c_size_t, POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBXchgcoeffs.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 732
if hasattr(_libs['gurobi'], 'GRBsetpwlobj'):
    GRBsetpwlobj = _libs['gurobi'].GRBsetpwlobj
    GRBsetpwlobj.argtypes = [POINTER(GRBmodel), c_int, c_int, POINTER(c_double), POINTER(c_double)]
    GRBsetpwlobj.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 736
if hasattr(_libs['gurobi'], 'GRBupdatemodel'):
    GRBupdatemodel = _libs['gurobi'].GRBupdatemodel
    GRBupdatemodel.argtypes = [POINTER(GRBmodel)]
    GRBupdatemodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 739
if hasattr(_libs['gurobi'], 'GRBresetmodel'):
    GRBresetmodel = _libs['gurobi'].GRBresetmodel
    GRBresetmodel.argtypes = [POINTER(GRBmodel)]
    GRBresetmodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 742
if hasattr(_libs['gurobi'], 'GRBfreemodel'):
    GRBfreemodel = _libs['gurobi'].GRBfreemodel
    GRBfreemodel.argtypes = [POINTER(GRBmodel)]
    GRBfreemodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 745
if hasattr(_libs['gurobi'], 'GRBcomputeIIS'):
    GRBcomputeIIS = _libs['gurobi'].GRBcomputeIIS
    GRBcomputeIIS.argtypes = [POINTER(GRBmodel)]
    GRBcomputeIIS.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 754
class struct__GRBsvec(Structure):
    pass

struct__GRBsvec.__slots__ = [
    'len',
    'ind',
    'val',
]
struct__GRBsvec._fields_ = [
    ('len', c_int),
    ('ind', POINTER(c_int)),
    ('val', POINTER(c_double)),
]

GRBsvec = struct__GRBsvec # /opt/gurobi702/linux64/include/gurobi_c.h: 754

# /opt/gurobi702/linux64/include/gurobi_c.h: 757
if hasattr(_libs['gurobi'], 'GRBFSolve'):
    GRBFSolve = _libs['gurobi'].GRBFSolve
    GRBFSolve.argtypes = [POINTER(GRBmodel), POINTER(GRBsvec), POINTER(GRBsvec)]
    GRBFSolve.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 760
if hasattr(_libs['gurobi'], 'GRBBinvColj'):
    GRBBinvColj = _libs['gurobi'].GRBBinvColj
    GRBBinvColj.argtypes = [POINTER(GRBmodel), c_int, POINTER(GRBsvec)]
    GRBBinvColj.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 763
if hasattr(_libs['gurobi'], 'GRBBinvj'):
    GRBBinvj = _libs['gurobi'].GRBBinvj
    GRBBinvj.argtypes = [POINTER(GRBmodel), c_int, POINTER(GRBsvec)]
    GRBBinvj.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 766
if hasattr(_libs['gurobi'], 'GRBBSolve'):
    GRBBSolve = _libs['gurobi'].GRBBSolve
    GRBBSolve.argtypes = [POINTER(GRBmodel), POINTER(GRBsvec), POINTER(GRBsvec)]
    GRBBSolve.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 769
if hasattr(_libs['gurobi'], 'GRBBinvi'):
    GRBBinvi = _libs['gurobi'].GRBBinvi
    GRBBinvi.argtypes = [POINTER(GRBmodel), c_int, POINTER(GRBsvec)]
    GRBBinvi.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 772
if hasattr(_libs['gurobi'], 'GRBBinvRowi'):
    GRBBinvRowi = _libs['gurobi'].GRBBinvRowi
    GRBBinvRowi.argtypes = [POINTER(GRBmodel), c_int, POINTER(GRBsvec)]
    GRBBinvRowi.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 775
if hasattr(_libs['gurobi'], 'GRBgetBasisHead'):
    GRBgetBasisHead = _libs['gurobi'].GRBgetBasisHead
    GRBgetBasisHead.argtypes = [POINTER(GRBmodel), POINTER(c_int)]
    GRBgetBasisHead.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 806
if hasattr(_libs['gurobi'], 'GRBstrongbranch'):
    GRBstrongbranch = _libs['gurobi'].GRBstrongbranch
    GRBstrongbranch.argtypes = [POINTER(GRBmodel), c_int, POINTER(c_int), POINTER(c_double), POINTER(c_double), POINTER(c_int)]
    GRBstrongbranch.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1005
if hasattr(_libs['gurobi'], 'GRBcheckmodel'):
    GRBcheckmodel = _libs['gurobi'].GRBcheckmodel
    GRBcheckmodel.argtypes = [POINTER(GRBmodel)]
    GRBcheckmodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1007
if hasattr(_libs['gurobi'], 'GRBsetsignal'):
    GRBsetsignal = _libs['gurobi'].GRBsetsignal
    GRBsetsignal.argtypes = [POINTER(GRBmodel)]
    GRBsetsignal.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1009
if hasattr(_libs['gurobi'], 'GRBterminate'):
    GRBterminate = _libs['gurobi'].GRBterminate
    GRBterminate.argtypes = [POINTER(GRBmodel)]
    GRBterminate.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1011
if hasattr(_libs['gurobi'], 'GRBreplay'):
    GRBreplay = _libs['gurobi'].GRBreplay
    GRBreplay.argtypes = [String]
    GRBreplay.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1013
if hasattr(_libs['gurobi'], 'GRBclean2'):
    GRBclean2 = _libs['gurobi'].GRBclean2
    GRBclean2.argtypes = [POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBclean2.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1015
if hasattr(_libs['gurobi'], 'GRBclean3'):
    GRBclean3 = _libs['gurobi'].GRBclean3
    GRBclean3.argtypes = [POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_double)]
    GRBclean3.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1020
if hasattr(_libs['gurobi'], 'GRBmsg'):
    GRBmsg = _libs['gurobi'].GRBmsg
    GRBmsg.argtypes = [POINTER(GRBenv), String]
    GRBmsg.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1027
if hasattr(_libs['gurobi'], 'GRBgetlogfile'):
    GRBgetlogfile = _libs['gurobi'].GRBgetlogfile
    GRBgetlogfile.argtypes = [POINTER(GRBenv), POINTER(POINTER(FILE))]
    GRBgetlogfile.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1029
if hasattr(_libs['gurobi'], 'GRBsetlogfile'):
    GRBsetlogfile = _libs['gurobi'].GRBsetlogfile
    GRBsetlogfile.argtypes = [POINTER(GRBenv), POINTER(FILE)]
    GRBsetlogfile.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1035
if hasattr(_libs['gurobi'], 'GRBgetintparam'):
    GRBgetintparam = _libs['gurobi'].GRBgetintparam
    GRBgetintparam.argtypes = [POINTER(GRBenv), String, POINTER(c_int)]
    GRBgetintparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1037
if hasattr(_libs['gurobi'], 'GRBgetdblparam'):
    GRBgetdblparam = _libs['gurobi'].GRBgetdblparam
    GRBgetdblparam.argtypes = [POINTER(GRBenv), String, POINTER(c_double)]
    GRBgetdblparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1039
if hasattr(_libs['gurobi'], 'GRBgetstrparam'):
    GRBgetstrparam = _libs['gurobi'].GRBgetstrparam
    GRBgetstrparam.argtypes = [POINTER(GRBenv), String, String]
    GRBgetstrparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1041
if hasattr(_libs['gurobi'], 'GRBgetintparaminfo'):
    GRBgetintparaminfo = _libs['gurobi'].GRBgetintparaminfo
    GRBgetintparaminfo.argtypes = [POINTER(GRBenv), String, POINTER(c_int), POINTER(c_int), POINTER(c_int), POINTER(c_int)]
    GRBgetintparaminfo.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1044
if hasattr(_libs['gurobi'], 'GRBgetdblparaminfo'):
    GRBgetdblparaminfo = _libs['gurobi'].GRBgetdblparaminfo
    GRBgetdblparaminfo.argtypes = [POINTER(GRBenv), String, POINTER(c_double), POINTER(c_double), POINTER(c_double), POINTER(c_double)]
    GRBgetdblparaminfo.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1047
if hasattr(_libs['gurobi'], 'GRBgetstrparaminfo'):
    GRBgetstrparaminfo = _libs['gurobi'].GRBgetstrparaminfo
    GRBgetstrparaminfo.argtypes = [POINTER(GRBenv), String, String, String]
    GRBgetstrparaminfo.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1050
if hasattr(_libs['gurobi'], 'GRBsetparam'):
    GRBsetparam = _libs['gurobi'].GRBsetparam
    GRBsetparam.argtypes = [POINTER(GRBenv), String, String]
    GRBsetparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1052
if hasattr(_libs['gurobi'], 'GRBsetintparam'):
    GRBsetintparam = _libs['gurobi'].GRBsetintparam
    GRBsetintparam.argtypes = [POINTER(GRBenv), String, c_int]
    GRBsetintparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1054
if hasattr(_libs['gurobi'], 'GRBsetdblparam'):
    GRBsetdblparam = _libs['gurobi'].GRBsetdblparam
    GRBsetdblparam.argtypes = [POINTER(GRBenv), String, c_double]
    GRBsetdblparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1056
if hasattr(_libs['gurobi'], 'GRBsetstrparam'):
    GRBsetstrparam = _libs['gurobi'].GRBsetstrparam
    GRBsetstrparam.argtypes = [POINTER(GRBenv), String, String]
    GRBsetstrparam.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1058
if hasattr(_libs['gurobi'], 'GRBgetparamtype'):
    GRBgetparamtype = _libs['gurobi'].GRBgetparamtype
    GRBgetparamtype.argtypes = [POINTER(GRBenv), String]
    GRBgetparamtype.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1060
if hasattr(_libs['gurobi'], 'GRBresetparams'):
    GRBresetparams = _libs['gurobi'].GRBresetparams
    GRBresetparams.argtypes = [POINTER(GRBenv)]
    GRBresetparams.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1062
if hasattr(_libs['gurobi'], 'GRBcopyparams'):
    GRBcopyparams = _libs['gurobi'].GRBcopyparams
    GRBcopyparams.argtypes = [POINTER(GRBenv), POINTER(GRBenv)]
    GRBcopyparams.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1064
if hasattr(_libs['gurobi'], 'GRBwriteparams'):
    GRBwriteparams = _libs['gurobi'].GRBwriteparams
    GRBwriteparams.argtypes = [POINTER(GRBenv), String]
    GRBwriteparams.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1066
if hasattr(_libs['gurobi'], 'GRBreadparams'):
    GRBreadparams = _libs['gurobi'].GRBreadparams
    GRBreadparams.argtypes = [POINTER(GRBenv), String]
    GRBreadparams.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1068
if hasattr(_libs['gurobi'], 'GRBgetnumparams'):
    GRBgetnumparams = _libs['gurobi'].GRBgetnumparams
    GRBgetnumparams.argtypes = [POINTER(GRBenv)]
    GRBgetnumparams.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1070
if hasattr(_libs['gurobi'], 'GRBgetparamname'):
    GRBgetparamname = _libs['gurobi'].GRBgetparamname
    GRBgetparamname.argtypes = [POINTER(GRBenv), c_int, POINTER(POINTER(c_char))]
    GRBgetparamname.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1072
if hasattr(_libs['gurobi'], 'GRBgetnumattributes'):
    GRBgetnumattributes = _libs['gurobi'].GRBgetnumattributes
    GRBgetnumattributes.argtypes = [POINTER(GRBmodel)]
    GRBgetnumattributes.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1074
if hasattr(_libs['gurobi'], 'GRBgetattrname'):
    GRBgetattrname = _libs['gurobi'].GRBgetattrname
    GRBgetattrname.argtypes = [POINTER(GRBmodel), c_int, POINTER(POINTER(c_char))]
    GRBgetattrname.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1079
if hasattr(_libs['gurobi'], 'GRBloadenv'):
    GRBloadenv = _libs['gurobi'].GRBloadenv
    GRBloadenv.argtypes = [POINTER(POINTER(GRBenv)), String]
    GRBloadenv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1081
if hasattr(_libs['gurobi'], 'GRBloadenvadv'):
    GRBloadenvadv = _libs['gurobi'].GRBloadenvadv
    GRBloadenvadv.argtypes = [POINTER(POINTER(GRBenv)), String, c_int, c_int, c_int, c_int, CFUNCTYPE(UNCHECKED(c_int), POINTER(GRBmodel), POINTER(None), c_int, POINTER(None)), POINTER(None)]
    GRBloadenvadv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1085
if hasattr(_libs['gurobi'], 'GRBloadclientenv'):
    GRBloadclientenv = _libs['gurobi'].GRBloadclientenv
    GRBloadclientenv.argtypes = [POINTER(POINTER(GRBenv)), String, String, c_int, String, c_int, c_double]
    GRBloadclientenv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1089
if hasattr(_libs['gurobi'], 'GRBloadclientenvadv'):
    GRBloadclientenvadv = _libs['gurobi'].GRBloadclientenvadv
    GRBloadclientenvadv.argtypes = [POINTER(POINTER(GRBenv)), String, String, c_int, String, c_int, c_double, c_int, c_int, c_int, c_int, CFUNCTYPE(UNCHECKED(c_int), POINTER(GRBmodel), POINTER(None), c_int, POINTER(None)), POINTER(None)]
    GRBloadclientenvadv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1095
if hasattr(_libs['gurobi'], 'GRBloadcloudenv'):
    GRBloadcloudenv = _libs['gurobi'].GRBloadcloudenv
    GRBloadcloudenv.argtypes = [POINTER(POINTER(GRBenv)), String, String, String, String]
    GRBloadcloudenv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1099
if hasattr(_libs['gurobi'], 'GRBloadcloudenvadv'):
    GRBloadcloudenvadv = _libs['gurobi'].GRBloadcloudenvadv
    GRBloadcloudenvadv.argtypes = [POINTER(POINTER(GRBenv)), String, String, String, String, c_int, c_int, c_int, c_int, CFUNCTYPE(UNCHECKED(c_int), POINTER(GRBmodel), POINTER(None), c_int, POINTER(None)), POINTER(None)]
    GRBloadcloudenvadv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1104
if hasattr(_libs['gurobi'], 'GRBgetenv'):
    GRBgetenv = _libs['gurobi'].GRBgetenv
    GRBgetenv.argtypes = [POINTER(GRBmodel)]
    GRBgetenv.restype = POINTER(GRBenv)

# /opt/gurobi702/linux64/include/gurobi_c.h: 1106
if hasattr(_libs['gurobi'], 'GRBgetconcurrentenv'):
    GRBgetconcurrentenv = _libs['gurobi'].GRBgetconcurrentenv
    GRBgetconcurrentenv.argtypes = [POINTER(GRBmodel), c_int]
    GRBgetconcurrentenv.restype = POINTER(GRBenv)

# /opt/gurobi702/linux64/include/gurobi_c.h: 1109
if hasattr(_libs['gurobi'], 'GRBdiscardconcurrentenvs'):
    GRBdiscardconcurrentenvs = _libs['gurobi'].GRBdiscardconcurrentenvs
    GRBdiscardconcurrentenvs.argtypes = [POINTER(GRBmodel)]
    GRBdiscardconcurrentenvs.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1111
if hasattr(_libs['gurobi'], 'GRBreleaselicense'):
    GRBreleaselicense = _libs['gurobi'].GRBreleaselicense
    GRBreleaselicense.argtypes = [POINTER(GRBenv)]
    GRBreleaselicense.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1113
if hasattr(_libs['gurobi'], 'GRBfreeenv'):
    GRBfreeenv = _libs['gurobi'].GRBfreeenv
    GRBfreeenv.argtypes = [POINTER(GRBenv)]
    GRBfreeenv.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1114
if hasattr(_libs['gurobi'], 'GRBgeterrormsg'):
    GRBgeterrormsg = _libs['gurobi'].GRBgeterrormsg
    GRBgeterrormsg.argtypes = [POINTER(GRBenv)]
    if sizeof(c_int) == sizeof(c_void_p):
        GRBgeterrormsg.restype = ReturnString
    else:
        GRBgeterrormsg.restype = String
        GRBgeterrormsg.errcheck = ReturnString

# /opt/gurobi702/linux64/include/gurobi_c.h: 1116
if hasattr(_libs['gurobi'], 'GRBgetmerrormsg'):
    GRBgetmerrormsg = _libs['gurobi'].GRBgetmerrormsg
    GRBgetmerrormsg.argtypes = [POINTER(GRBmodel)]
    if sizeof(c_int) == sizeof(c_void_p):
        GRBgetmerrormsg.restype = ReturnString
    else:
        GRBgetmerrormsg.restype = String
        GRBgetmerrormsg.errcheck = ReturnString

# /opt/gurobi702/linux64/include/gurobi_c.h: 1122
if hasattr(_libs['gurobi'], 'GRBversion'):
    GRBversion = _libs['gurobi'].GRBversion
    GRBversion.argtypes = [POINTER(c_int), POINTER(c_int), POINTER(c_int)]
    GRBversion.restype = None

# /opt/gurobi702/linux64/include/gurobi_c.h: 1124
if hasattr(_libs['gurobi'], 'GRBplatform'):
    GRBplatform = _libs['gurobi'].GRBplatform
    GRBplatform.argtypes = []
    if sizeof(c_int) == sizeof(c_void_p):
        GRBplatform.restype = ReturnString
    else:
        GRBplatform.restype = String
        GRBplatform.errcheck = ReturnString

# /opt/gurobi702/linux64/include/gurobi_c.h: 1128
if hasattr(_libs['gurobi'], 'GRBlisttokens'):
    GRBlisttokens = _libs['gurobi'].GRBlisttokens
    GRBlisttokens.argtypes = []
    GRBlisttokens.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1130
if hasattr(_libs['gurobi'], 'GRBlistclients'):
    GRBlistclients = _libs['gurobi'].GRBlistclients
    GRBlistclients.argtypes = [String, c_int]
    GRBlistclients.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1132
if hasattr(_libs['gurobi'], 'GRBchangeuserpassword'):
    GRBchangeuserpassword = _libs['gurobi'].GRBchangeuserpassword
    GRBchangeuserpassword.argtypes = [String, c_int, String, String]
    GRBchangeuserpassword.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1136
if hasattr(_libs['gurobi'], 'GRBchangeadminpassword'):
    GRBchangeadminpassword = _libs['gurobi'].GRBchangeadminpassword
    GRBchangeadminpassword.argtypes = [String, c_int, String, String]
    GRBchangeadminpassword.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1140
if hasattr(_libs['gurobi'], 'GRBchangejoblimit'):
    GRBchangejoblimit = _libs['gurobi'].GRBchangejoblimit
    GRBchangejoblimit.argtypes = [String, c_int, c_int, String]
    GRBchangejoblimit.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1143
if hasattr(_libs['gurobi'], 'GRBkilljob'):
    GRBkilljob = _libs['gurobi'].GRBkilljob
    GRBkilljob.argtypes = [String, c_int, String, String]
    GRBkilljob.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1146
if hasattr(_libs['gurobi'], 'GRBshutdown'):
    GRBshutdown = _libs['gurobi'].GRBshutdown
    GRBshutdown.argtypes = [String, c_int, String]
    GRBshutdown.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1151
if hasattr(_libs['gurobi'], 'GRBtunemodel'):
    GRBtunemodel = _libs['gurobi'].GRBtunemodel
    GRBtunemodel.argtypes = [POINTER(GRBmodel)]
    GRBtunemodel.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1153
if hasattr(_libs['gurobi'], 'GRBtunemodels'):
    GRBtunemodels = _libs['gurobi'].GRBtunemodels
    GRBtunemodels.argtypes = [c_int, POINTER(POINTER(GRBmodel)), POINTER(GRBmodel), POINTER(GRBmodel)]
    GRBtunemodels.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1156
if hasattr(_libs['gurobi'], 'GRBgettuneresult'):
    GRBgettuneresult = _libs['gurobi'].GRBgettuneresult
    GRBgettuneresult.argtypes = [POINTER(GRBmodel), c_int]
    GRBgettuneresult.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1158
if hasattr(_libs['gurobi'], 'GRBgettunelog'):
    GRBgettunelog = _libs['gurobi'].GRBgettunelog
    GRBgettunelog.argtypes = [POINTER(GRBmodel), c_int, POINTER(POINTER(c_char))]
    GRBgettunelog.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1160
if hasattr(_libs['gurobi'], 'GRBtunemodeladv'):
    GRBtunemodeladv = _libs['gurobi'].GRBtunemodeladv
    GRBtunemodeladv.argtypes = [POINTER(GRBmodel), POINTER(GRBmodel), POINTER(GRBmodel)]
    GRBtunemodeladv.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 1166
if hasattr(_libs['gurobi'], 'GRBsync'):
    GRBsync = _libs['gurobi'].GRBsync
    GRBsync.argtypes = [POINTER(GRBmodel)]
    GRBsync.restype = c_int

# /opt/gurobi702/linux64/include/gurobi_c.h: 26
try:
    GRB_VERSION_MAJOR = 7
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 27
try:
    GRB_VERSION_MINOR = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 28
try:
    GRB_VERSION_TECHNICAL = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 32
try:
    DEFAULT_CS_PRIORITY = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 33
try:
    MAX_CS_PRIORITY = 100
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 37
try:
    DEFAULT_CS_PORT = 61000
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 41
try:
    GRB_ERROR_OUT_OF_MEMORY = 10001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 42
try:
    GRB_ERROR_NULL_ARGUMENT = 10002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 43
try:
    GRB_ERROR_INVALID_ARGUMENT = 10003
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 44
try:
    GRB_ERROR_UNKNOWN_ATTRIBUTE = 10004
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 45
try:
    GRB_ERROR_DATA_NOT_AVAILABLE = 10005
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 46
try:
    GRB_ERROR_INDEX_OUT_OF_RANGE = 10006
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 47
try:
    GRB_ERROR_UNKNOWN_PARAMETER = 10007
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 48
try:
    GRB_ERROR_VALUE_OUT_OF_RANGE = 10008
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 49
try:
    GRB_ERROR_NO_LICENSE = 10009
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 50
try:
    GRB_ERROR_SIZE_LIMIT_EXCEEDED = 10010
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 51
try:
    GRB_ERROR_CALLBACK = 10011
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 52
try:
    GRB_ERROR_FILE_READ = 10012
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 53
try:
    GRB_ERROR_FILE_WRITE = 10013
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 54
try:
    GRB_ERROR_NUMERIC = 10014
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 55
try:
    GRB_ERROR_IIS_NOT_INFEASIBLE = 10015
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 56
try:
    GRB_ERROR_NOT_FOR_MIP = 10016
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 57
try:
    GRB_ERROR_OPTIMIZATION_IN_PROGRESS = 10017
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 58
try:
    GRB_ERROR_DUPLICATES = 10018
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 59
try:
    GRB_ERROR_NODEFILE = 10019
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 60
try:
    GRB_ERROR_Q_NOT_PSD = 10020
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 61
try:
    GRB_ERROR_QCP_EQUALITY_CONSTRAINT = 10021
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 62
try:
    GRB_ERROR_NETWORK = 10022
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 63
try:
    GRB_ERROR_JOB_REJECTED = 10023
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 64
try:
    GRB_ERROR_NOT_SUPPORTED = 10024
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 65
try:
    GRB_ERROR_EXCEED_2B_NONZEROS = 10025
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 66
try:
    GRB_ERROR_INVALID_PIECEWISE_OBJ = 10026
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 67
try:
    GRB_ERROR_UPDATEMODE_CHANGE = 10027
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 68
try:
    GRB_ERROR_CLOUD = 10028
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 69
try:
    GRB_ERROR_MODEL_MODIFICATION = 10029
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 73
try:
    GRB_LESS_EQUAL = '<'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 74
try:
    GRB_GREATER_EQUAL = '>'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 75
try:
    GRB_EQUAL = '='
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 79
try:
    GRB_CONTINUOUS = 'C'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 80
try:
    GRB_BINARY = 'B'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 81
try:
    GRB_INTEGER = 'I'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 82
try:
    GRB_SEMICONT = 'S'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 83
try:
    GRB_SEMIINT = 'N'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 87
try:
    GRB_MINIMIZE = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 88
try:
    GRB_MAXIMIZE = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 92
try:
    GRB_SOS_TYPE1 = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 93
try:
    GRB_SOS_TYPE2 = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 97
try:
    GRB_INFINITY = 1e+100
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 98
try:
    GRB_UNDEFINED = 1e+101
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 99
try:
    GRB_MAXINT = 2000000000
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 103
try:
    GRB_MAX_NAMELEN = 255
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 104
try:
    GRB_MAX_STRLEN = 512
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 105
try:
    GRB_MAX_CONCURRENT = 64
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 236
try:
    GRB_INT_ATTR_NUMCONSTRS = 'NumConstrs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 237
try:
    GRB_INT_ATTR_NUMVARS = 'NumVars'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 238
try:
    GRB_INT_ATTR_NUMSOS = 'NumSOS'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 239
try:
    GRB_INT_ATTR_NUMQCONSTRS = 'NumQConstrs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 240
try:
    GRB_INT_ATTR_NUMGENCONSTRS = 'NumGenConstrs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 241
try:
    GRB_INT_ATTR_NUMNZS = 'NumNZs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 242
try:
    GRB_DBL_ATTR_DNUMNZS = 'DNumNZs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 243
try:
    GRB_INT_ATTR_NUMQNZS = 'NumQNZs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 244
try:
    GRB_INT_ATTR_NUMQCNZS = 'NumQCNZs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 245
try:
    GRB_INT_ATTR_NUMINTVARS = 'NumIntVars'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 246
try:
    GRB_INT_ATTR_NUMBINVARS = 'NumBinVars'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 247
try:
    GRB_INT_ATTR_NUMPWLOBJVARS = 'NumPWLObjVars'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 248
try:
    GRB_STR_ATTR_MODELNAME = 'ModelName'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 249
try:
    GRB_INT_ATTR_MODELSENSE = 'ModelSense'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 250
try:
    GRB_DBL_ATTR_OBJCON = 'ObjCon'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 251
try:
    GRB_INT_ATTR_IS_MIP = 'IsMIP'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 252
try:
    GRB_INT_ATTR_IS_QP = 'IsQP'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 253
try:
    GRB_INT_ATTR_IS_QCP = 'IsQCP'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 254
try:
    GRB_STR_ATTR_SERVER = 'Server'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 258
try:
    GRB_DBL_ATTR_LB = 'LB'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 259
try:
    GRB_DBL_ATTR_UB = 'UB'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 260
try:
    GRB_DBL_ATTR_OBJ = 'Obj'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 261
try:
    GRB_CHAR_ATTR_VTYPE = 'VType'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 262
try:
    GRB_DBL_ATTR_START = 'Start'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 263
try:
    GRB_DBL_ATTR_PSTART = 'PStart'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 264
try:
    GRB_INT_ATTR_BRANCHPRIORITY = 'BranchPriority'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 265
try:
    GRB_STR_ATTR_VARNAME = 'VarName'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 266
try:
    GRB_INT_ATTR_PWLOBJCVX = 'PWLObjCvx'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 267
try:
    GRB_DBL_ATTR_VARHINTVAL = 'VarHintVal'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 268
try:
    GRB_INT_ATTR_VARHINTPRI = 'VarHintPri'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 272
try:
    GRB_DBL_ATTR_RHS = 'RHS'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 273
try:
    GRB_DBL_ATTR_DSTART = 'DStart'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 274
try:
    GRB_CHAR_ATTR_SENSE = 'Sense'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 275
try:
    GRB_STR_ATTR_CONSTRNAME = 'ConstrName'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 276
try:
    GRB_INT_ATTR_LAZY = 'Lazy'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 280
try:
    GRB_DBL_ATTR_QCRHS = 'QCRHS'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 281
try:
    GRB_CHAR_ATTR_QCSENSE = 'QCSense'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 282
try:
    GRB_STR_ATTR_QCNAME = 'QCName'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 286
try:
    GRB_INT_ATTR_GENCONSTRTYPE = 'GenConstrType'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 287
try:
    GRB_STR_ATTR_GENCONSTRNAME = 'GenConstrName'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 291
try:
    GRB_DBL_ATTR_MAX_COEFF = 'MaxCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 292
try:
    GRB_DBL_ATTR_MIN_COEFF = 'MinCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 293
try:
    GRB_DBL_ATTR_MAX_BOUND = 'MaxBound'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 294
try:
    GRB_DBL_ATTR_MIN_BOUND = 'MinBound'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 295
try:
    GRB_DBL_ATTR_MAX_OBJ_COEFF = 'MaxObjCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 296
try:
    GRB_DBL_ATTR_MIN_OBJ_COEFF = 'MinObjCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 297
try:
    GRB_DBL_ATTR_MAX_RHS = 'MaxRHS'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 298
try:
    GRB_DBL_ATTR_MIN_RHS = 'MinRHS'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 299
try:
    GRB_DBL_ATTR_MAX_QCCOEFF = 'MaxQCCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 300
try:
    GRB_DBL_ATTR_MIN_QCCOEFF = 'MinQCCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 301
try:
    GRB_DBL_ATTR_MAX_QOBJ_COEFF = 'MaxQObjCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 302
try:
    GRB_DBL_ATTR_MIN_QOBJ_COEFF = 'MinQObjCoeff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 306
try:
    GRB_DBL_ATTR_RUNTIME = 'Runtime'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 307
try:
    GRB_INT_ATTR_STATUS = 'Status'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 308
try:
    GRB_DBL_ATTR_OBJVAL = 'ObjVal'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 309
try:
    GRB_DBL_ATTR_OBJBOUND = 'ObjBound'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 310
try:
    GRB_DBL_ATTR_OBJBOUNDC = 'ObjBoundC'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 311
try:
    GRB_DBL_ATTR_POOLOBJBOUND = 'PoolObjBound'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 312
try:
    GRB_DBL_ATTR_POOLOBJVAL = 'PoolObjVal'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 313
try:
    GRB_DBL_ATTR_MIPGAP = 'MIPGap'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 314
try:
    GRB_INT_ATTR_SOLCOUNT = 'SolCount'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 315
try:
    GRB_DBL_ATTR_ITERCOUNT = 'IterCount'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 316
try:
    GRB_INT_ATTR_BARITERCOUNT = 'BarIterCount'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 317
try:
    GRB_DBL_ATTR_NODECOUNT = 'NodeCount'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 318
try:
    GRB_DBL_ATTR_OPENNODECOUNT = 'OpenNodeCount'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 319
try:
    GRB_INT_ATTR_HASDUALNORM = 'HasDualNorm'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 325
try:
    GRB_DBL_ATTR_X = 'X'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 326
try:
    GRB_DBL_ATTR_XN = 'Xn'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 327
try:
    GRB_DBL_ATTR_BARX = 'BarX'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 328
try:
    GRB_DBL_ATTR_RC = 'RC'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 329
try:
    GRB_DBL_ATTR_VDUALNORM = 'VDualNorm'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 330
try:
    GRB_INT_ATTR_VBASIS = 'VBasis'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 334
try:
    GRB_DBL_ATTR_PI = 'Pi'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 335
try:
    GRB_DBL_ATTR_QCPI = 'QCPi'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 336
try:
    GRB_DBL_ATTR_SLACK = 'Slack'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 337
try:
    GRB_DBL_ATTR_QCSLACK = 'QCSlack'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 338
try:
    GRB_DBL_ATTR_CDUALNORM = 'CDualNorm'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 339
try:
    GRB_INT_ATTR_CBASIS = 'CBasis'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 343
try:
    GRB_DBL_ATTR_BOUND_VIO = 'BoundVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 344
try:
    GRB_DBL_ATTR_BOUND_SVIO = 'BoundSVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 345
try:
    GRB_INT_ATTR_BOUND_VIO_INDEX = 'BoundVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 346
try:
    GRB_INT_ATTR_BOUND_SVIO_INDEX = 'BoundSVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 347
try:
    GRB_DBL_ATTR_BOUND_VIO_SUM = 'BoundVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 348
try:
    GRB_DBL_ATTR_BOUND_SVIO_SUM = 'BoundSVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 349
try:
    GRB_DBL_ATTR_CONSTR_VIO = 'ConstrVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 350
try:
    GRB_DBL_ATTR_CONSTR_SVIO = 'ConstrSVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 351
try:
    GRB_INT_ATTR_CONSTR_VIO_INDEX = 'ConstrVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 352
try:
    GRB_INT_ATTR_CONSTR_SVIO_INDEX = 'ConstrSVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 353
try:
    GRB_DBL_ATTR_CONSTR_VIO_SUM = 'ConstrVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 354
try:
    GRB_DBL_ATTR_CONSTR_SVIO_SUM = 'ConstrSVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 355
try:
    GRB_DBL_ATTR_CONSTR_RESIDUAL = 'ConstrResidual'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 356
try:
    GRB_DBL_ATTR_CONSTR_SRESIDUAL = 'ConstrSResidual'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 357
try:
    GRB_INT_ATTR_CONSTR_RESIDUAL_INDEX = 'ConstrResidualIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 358
try:
    GRB_INT_ATTR_CONSTR_SRESIDUAL_INDEX = 'ConstrSResidualIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 359
try:
    GRB_DBL_ATTR_CONSTR_RESIDUAL_SUM = 'ConstrResidualSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 360
try:
    GRB_DBL_ATTR_CONSTR_SRESIDUAL_SUM = 'ConstrSResidualSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 361
try:
    GRB_DBL_ATTR_DUAL_VIO = 'DualVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 362
try:
    GRB_DBL_ATTR_DUAL_SVIO = 'DualSVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 363
try:
    GRB_INT_ATTR_DUAL_VIO_INDEX = 'DualVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 364
try:
    GRB_INT_ATTR_DUAL_SVIO_INDEX = 'DualSVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 365
try:
    GRB_DBL_ATTR_DUAL_VIO_SUM = 'DualVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 366
try:
    GRB_DBL_ATTR_DUAL_SVIO_SUM = 'DualSVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 367
try:
    GRB_DBL_ATTR_DUAL_RESIDUAL = 'DualResidual'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 368
try:
    GRB_DBL_ATTR_DUAL_SRESIDUAL = 'DualSResidual'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 369
try:
    GRB_INT_ATTR_DUAL_RESIDUAL_INDEX = 'DualResidualIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 370
try:
    GRB_INT_ATTR_DUAL_SRESIDUAL_INDEX = 'DualSResidualIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 371
try:
    GRB_DBL_ATTR_DUAL_RESIDUAL_SUM = 'DualResidualSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 372
try:
    GRB_DBL_ATTR_DUAL_SRESIDUAL_SUM = 'DualSResidualSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 373
try:
    GRB_DBL_ATTR_INT_VIO = 'IntVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 374
try:
    GRB_INT_ATTR_INT_VIO_INDEX = 'IntVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 375
try:
    GRB_DBL_ATTR_INT_VIO_SUM = 'IntVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 376
try:
    GRB_DBL_ATTR_COMPL_VIO = 'ComplVio'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 377
try:
    GRB_INT_ATTR_COMPL_VIO_INDEX = 'ComplVioIndex'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 378
try:
    GRB_DBL_ATTR_COMPL_VIO_SUM = 'ComplVioSum'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 379
try:
    GRB_DBL_ATTR_KAPPA = 'Kappa'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 380
try:
    GRB_DBL_ATTR_KAPPA_EXACT = 'KappaExact'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 381
try:
    GRB_DBL_ATTR_N2KAPPA = 'N2Kappa'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 385
try:
    GRB_DBL_ATTR_SA_OBJLOW = 'SAObjLow'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 386
try:
    GRB_DBL_ATTR_SA_OBJUP = 'SAObjUp'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 387
try:
    GRB_DBL_ATTR_SA_LBLOW = 'SALBLow'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 388
try:
    GRB_DBL_ATTR_SA_LBUP = 'SALBUp'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 389
try:
    GRB_DBL_ATTR_SA_UBLOW = 'SAUBLow'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 390
try:
    GRB_DBL_ATTR_SA_UBUP = 'SAUBUp'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 391
try:
    GRB_DBL_ATTR_SA_RHSLOW = 'SARHSLow'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 392
try:
    GRB_DBL_ATTR_SA_RHSUP = 'SARHSUp'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 396
try:
    GRB_INT_ATTR_IIS_MINIMAL = 'IISMinimal'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 397
try:
    GRB_INT_ATTR_IIS_LB = 'IISLB'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 398
try:
    GRB_INT_ATTR_IIS_UB = 'IISUB'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 399
try:
    GRB_INT_ATTR_IIS_CONSTR = 'IISConstr'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 400
try:
    GRB_INT_ATTR_IIS_SOS = 'IISSOS'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 401
try:
    GRB_INT_ATTR_IIS_QCONSTR = 'IISQConstr'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 402
try:
    GRB_INT_ATTR_IIS_GENCONSTR = 'IISGenConstr'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 406
try:
    GRB_INT_ATTR_TUNE_RESULTCOUNT = 'TuneResultCount'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 410
try:
    GRB_DBL_ATTR_FARKASDUAL = 'FarkasDual'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 411
try:
    GRB_DBL_ATTR_FARKASPROOF = 'FarkasProof'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 412
try:
    GRB_DBL_ATTR_UNBDRAY = 'UnbdRay'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 413
try:
    GRB_INT_ATTR_INFEASVAR = 'InfeasVar'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 414
try:
    GRB_INT_ATTR_UNBDVAR = 'UnbdVar'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 418
try:
    GRB_INT_ATTR_VARPRESTAT = 'VarPreStat'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 419
try:
    GRB_DBL_ATTR_PREFIXVAL = 'PreFixVal'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 423
try:
    GRB_DBL_ATTR_OBJN = 'ObjN'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 424
try:
    GRB_DBL_ATTR_OBJNVAL = 'ObjNVal'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 425
try:
    GRB_DBL_ATTR_OBJNCON = 'ObjNCon'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 426
try:
    GRB_DBL_ATTR_OBJNWEIGHT = 'ObjNWeight'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 427
try:
    GRB_INT_ATTR_OBJNPRIORITY = 'ObjNPriority'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 428
try:
    GRB_DBL_ATTR_OBJNRELTOL = 'ObjNRelTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 429
try:
    GRB_DBL_ATTR_OBJNABSTOL = 'ObjNAbsTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 430
try:
    GRB_STR_ATTR_OBJNNAME = 'ObjNName'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 431
try:
    GRB_INT_ATTR_NUMOBJ = 'NumObj'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 435
try:
    GRB_DBL_ATTR_Xn = 'Xn'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 439
try:
    GRB_GENCONSTR_MAX = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 440
try:
    GRB_GENCONSTR_MIN = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 441
try:
    GRB_GENCONSTR_ABS = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 442
try:
    GRB_GENCONSTR_AND = 3
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 443
try:
    GRB_GENCONSTR_OR = 4
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 444
try:
    GRB_GENCONSTR_INDICATOR = 5
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 453
try:
    GRB_CB_POLLING = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 454
try:
    GRB_CB_PRESOLVE = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 455
try:
    GRB_CB_SIMPLEX = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 456
try:
    GRB_CB_MIP = 3
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 457
try:
    GRB_CB_MIPSOL = 4
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 458
try:
    GRB_CB_MIPNODE = 5
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 459
try:
    GRB_CB_MESSAGE = 6
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 460
try:
    GRB_CB_BARRIER = 7
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 464
try:
    GRB_CB_PRE_COLDEL = 1000
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 465
try:
    GRB_CB_PRE_ROWDEL = 1001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 466
try:
    GRB_CB_PRE_SENCHG = 1002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 467
try:
    GRB_CB_PRE_BNDCHG = 1003
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 468
try:
    GRB_CB_PRE_COECHG = 1004
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 470
try:
    GRB_CB_SPX_ITRCNT = 2000
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 471
try:
    GRB_CB_SPX_OBJVAL = 2001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 472
try:
    GRB_CB_SPX_PRIMINF = 2002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 473
try:
    GRB_CB_SPX_DUALINF = 2003
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 474
try:
    GRB_CB_SPX_ISPERT = 2004
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 476
try:
    GRB_CB_MIP_OBJBST = 3000
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 477
try:
    GRB_CB_MIP_OBJBND = 3001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 478
try:
    GRB_CB_MIP_NODCNT = 3002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 479
try:
    GRB_CB_MIP_SOLCNT = 3003
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 480
try:
    GRB_CB_MIP_CUTCNT = 3004
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 481
try:
    GRB_CB_MIP_NODLFT = 3005
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 482
try:
    GRB_CB_MIP_ITRCNT = 3006
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 483
try:
    GRB_CB_MIP_OBJBNDC = 3007
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 485
try:
    GRB_CB_MIPSOL_SOL = 4001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 486
try:
    GRB_CB_MIPSOL_OBJ = 4002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 487
try:
    GRB_CB_MIPSOL_OBJBST = 4003
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 488
try:
    GRB_CB_MIPSOL_OBJBND = 4004
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 489
try:
    GRB_CB_MIPSOL_NODCNT = 4005
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 490
try:
    GRB_CB_MIPSOL_SOLCNT = 4006
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 491
try:
    GRB_CB_MIPSOL_OBJBNDC = 4007
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 493
try:
    GRB_CB_MIPNODE_STATUS = 5001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 494
try:
    GRB_CB_MIPNODE_REL = 5002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 495
try:
    GRB_CB_MIPNODE_OBJBST = 5003
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 496
try:
    GRB_CB_MIPNODE_OBJBND = 5004
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 497
try:
    GRB_CB_MIPNODE_NODCNT = 5005
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 498
try:
    GRB_CB_MIPNODE_SOLCNT = 5006
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 499
try:
    GRB_CB_MIPNODE_BRVAR = 5007
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 500
try:
    GRB_CB_MIPNODE_OBJBNDC = 5008
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 502
try:
    GRB_CB_MSG_STRING = 6001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 503
try:
    GRB_CB_RUNTIME = 6002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 505
try:
    GRB_CB_BARRIER_ITRCNT = 7001
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 506
try:
    GRB_CB_BARRIER_PRIMOBJ = 7002
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 507
try:
    GRB_CB_BARRIER_DUALOBJ = 7003
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 508
try:
    GRB_CB_BARRIER_PRIMINF = 7004
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 509
try:
    GRB_CB_BARRIER_DUALINF = 7005
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 510
try:
    GRB_CB_BARRIER_COMPL = 7006
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 512
try:
    GRB_FEASRELAX_LINEAR = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 513
try:
    GRB_FEASRELAX_QUADRATIC = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 514
try:
    GRB_FEASRELAX_CARDINALITY = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 779
try:
    GRB_LOADED = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 780
try:
    GRB_OPTIMAL = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 781
try:
    GRB_INFEASIBLE = 3
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 782
try:
    GRB_INF_OR_UNBD = 4
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 783
try:
    GRB_UNBOUNDED = 5
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 784
try:
    GRB_CUTOFF = 6
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 785
try:
    GRB_ITERATION_LIMIT = 7
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 786
try:
    GRB_NODE_LIMIT = 8
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 787
try:
    GRB_TIME_LIMIT = 9
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 788
try:
    GRB_SOLUTION_LIMIT = 10
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 789
try:
    GRB_INTERRUPTED = 11
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 790
try:
    GRB_NUMERIC = 12
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 791
try:
    GRB_SUBOPTIMAL = 13
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 792
try:
    GRB_INPROGRESS = 14
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 793
try:
    GRB_USER_OBJ_LIMIT = 15
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 797
try:
    GRB_BASIC = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 798
try:
    GRB_NONBASIC_LOWER = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 799
try:
    GRB_NONBASIC_UPPER = (-2)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 800
try:
    GRB_SUPERBASIC = (-3)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 816
try:
    GRB_INT_PAR_BARITERLIMIT = 'BarIterLimit'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 817
try:
    GRB_DBL_PAR_CUTOFF = 'Cutoff'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 818
try:
    GRB_DBL_PAR_ITERATIONLIMIT = 'IterationLimit'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 819
try:
    GRB_DBL_PAR_NODELIMIT = 'NodeLimit'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 820
try:
    GRB_INT_PAR_SOLUTIONLIMIT = 'SolutionLimit'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 821
try:
    GRB_DBL_PAR_TIMELIMIT = 'TimeLimit'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 822
try:
    GRB_DBL_PAR_BESTOBJSTOP = 'BestObjStop'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 823
try:
    GRB_DBL_PAR_BESTBDSTOP = 'BestBdStop'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 827
try:
    GRB_DBL_PAR_FEASIBILITYTOL = 'FeasibilityTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 828
try:
    GRB_DBL_PAR_INTFEASTOL = 'IntFeasTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 829
try:
    GRB_DBL_PAR_MARKOWITZTOL = 'MarkowitzTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 830
try:
    GRB_DBL_PAR_MIPGAP = 'MIPGap'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 831
try:
    GRB_DBL_PAR_MIPGAPABS = 'MIPGapAbs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 832
try:
    GRB_DBL_PAR_OPTIMALITYTOL = 'OptimalityTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 833
try:
    GRB_DBL_PAR_PSDTOL = 'PSDTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 837
try:
    GRB_INT_PAR_METHOD = 'Method'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 838
try:
    GRB_DBL_PAR_PERTURBVALUE = 'PerturbValue'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 839
try:
    GRB_DBL_PAR_OBJSCALE = 'ObjScale'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 840
try:
    GRB_INT_PAR_SCALEFLAG = 'ScaleFlag'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 841
try:
    GRB_INT_PAR_SIMPLEXPRICING = 'SimplexPricing'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 842
try:
    GRB_INT_PAR_QUAD = 'Quad'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 843
try:
    GRB_INT_PAR_NORMADJUST = 'NormAdjust'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 844
try:
    GRB_INT_PAR_SIFTING = 'Sifting'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 845
try:
    GRB_INT_PAR_SIFTMETHOD = 'SiftMethod'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 849
try:
    GRB_DBL_PAR_BARCONVTOL = 'BarConvTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 850
try:
    GRB_INT_PAR_BARCORRECTORS = 'BarCorrectors'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 851
try:
    GRB_INT_PAR_BARHOMOGENEOUS = 'BarHomogeneous'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 852
try:
    GRB_INT_PAR_BARORDER = 'BarOrder'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 853
try:
    GRB_DBL_PAR_BARQCPCONVTOL = 'BarQCPConvTol'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 854
try:
    GRB_INT_PAR_CROSSOVER = 'Crossover'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 855
try:
    GRB_INT_PAR_CROSSOVERBASIS = 'CrossoverBasis'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 859
try:
    GRB_INT_PAR_BRANCHDIR = 'BranchDir'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 860
try:
    GRB_INT_PAR_DEGENMOVES = 'DegenMoves'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 861
try:
    GRB_INT_PAR_DISCONNECTED = 'Disconnected'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 862
try:
    GRB_DBL_PAR_HEURISTICS = 'Heuristics'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 863
try:
    GRB_DBL_PAR_IMPROVESTARTGAP = 'ImproveStartGap'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 864
try:
    GRB_DBL_PAR_IMPROVESTARTTIME = 'ImproveStartTime'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 865
try:
    GRB_DBL_PAR_IMPROVESTARTNODES = 'ImproveStartNodes'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 866
try:
    GRB_INT_PAR_MINRELNODES = 'MinRelNodes'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 867
try:
    GRB_INT_PAR_MIPFOCUS = 'MIPFocus'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 868
try:
    GRB_STR_PAR_NODEFILEDIR = 'NodefileDir'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 869
try:
    GRB_DBL_PAR_NODEFILESTART = 'NodefileStart'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 870
try:
    GRB_INT_PAR_NODEMETHOD = 'NodeMethod'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 871
try:
    GRB_INT_PAR_NORELHEURISTIC = 'NoRelHeuristic'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 872
try:
    GRB_INT_PAR_PUMPPASSES = 'PumpPasses'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 873
try:
    GRB_INT_PAR_RINS = 'RINS'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 874
try:
    GRB_INT_PAR_SUBMIPNODES = 'SubMIPNodes'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 875
try:
    GRB_INT_PAR_SYMMETRY = 'Symmetry'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 876
try:
    GRB_INT_PAR_VARBRANCH = 'VarBranch'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 877
try:
    GRB_INT_PAR_SOLUTIONNUMBER = 'SolutionNumber'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 878
try:
    GRB_INT_PAR_ZEROOBJNODES = 'ZeroObjNodes'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 882
try:
    GRB_INT_PAR_CUTS = 'Cuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 884
try:
    GRB_INT_PAR_CLIQUECUTS = 'CliqueCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 885
try:
    GRB_INT_PAR_COVERCUTS = 'CoverCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 886
try:
    GRB_INT_PAR_FLOWCOVERCUTS = 'FlowCoverCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 887
try:
    GRB_INT_PAR_FLOWPATHCUTS = 'FlowPathCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 888
try:
    GRB_INT_PAR_GUBCOVERCUTS = 'GUBCoverCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 889
try:
    GRB_INT_PAR_IMPLIEDCUTS = 'ImpliedCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 890
try:
    GRB_INT_PAR_PROJIMPLIEDCUTS = 'ProjImpliedCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 891
try:
    GRB_INT_PAR_MIPSEPCUTS = 'MIPSepCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 892
try:
    GRB_INT_PAR_MIRCUTS = 'MIRCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 893
try:
    GRB_INT_PAR_STRONGCGCUTS = 'StrongCGCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 894
try:
    GRB_INT_PAR_MODKCUTS = 'ModKCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 895
try:
    GRB_INT_PAR_ZEROHALFCUTS = 'ZeroHalfCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 896
try:
    GRB_INT_PAR_NETWORKCUTS = 'NetworkCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 897
try:
    GRB_INT_PAR_SUBMIPCUTS = 'SubMIPCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 898
try:
    GRB_INT_PAR_INFPROOFCUTS = 'InfProofCuts'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 900
try:
    GRB_INT_PAR_CUTAGGPASSES = 'CutAggPasses'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 901
try:
    GRB_INT_PAR_CUTPASSES = 'CutPasses'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 902
try:
    GRB_INT_PAR_GOMORYPASSES = 'GomoryPasses'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 906
try:
    GRB_STR_PAR_WORKERPOOL = 'WorkerPool'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 907
try:
    GRB_STR_PAR_WORKERPASSWORD = 'WorkerPassword'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 908
try:
    GRB_INT_PAR_WORKERPORT = 'WorkerPort'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 912
try:
    GRB_INT_PAR_AGGREGATE = 'Aggregate'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 913
try:
    GRB_INT_PAR_AGGFILL = 'AggFill'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 914
try:
    GRB_INT_PAR_CONCURRENTMIP = 'ConcurrentMIP'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 915
try:
    GRB_INT_PAR_CONCURRENTJOBS = 'ConcurrentJobs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 916
try:
    GRB_INT_PAR_DISPLAYINTERVAL = 'DisplayInterval'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 917
try:
    GRB_INT_PAR_DISTRIBUTEDMIPJOBS = 'DistributedMIPJobs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 918
try:
    GRB_INT_PAR_DUALREDUCTIONS = 'DualReductions'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 919
try:
    GRB_DBL_PAR_FEASRELAXBIGM = 'FeasRelaxBigM'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 920
try:
    GRB_INT_PAR_IISMETHOD = 'IISMethod'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 921
try:
    GRB_INT_PAR_INFUNBDINFO = 'InfUnbdInfo'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 922
try:
    GRB_INT_PAR_LAZYCONSTRAINTS = 'LazyConstraints'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 923
try:
    GRB_STR_PAR_LOGFILE = 'LogFile'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 924
try:
    GRB_INT_PAR_LOGTOCONSOLE = 'LogToConsole'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 925
try:
    GRB_INT_PAR_MIQCPMETHOD = 'MIQCPMethod'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 926
try:
    GRB_INT_PAR_NUMERICFOCUS = 'NumericFocus'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 927
try:
    GRB_INT_PAR_OUTPUTFLAG = 'OutputFlag'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 928
try:
    GRB_INT_PAR_PRECRUSH = 'PreCrush'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 929
try:
    GRB_INT_PAR_PREDEPROW = 'PreDepRow'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 930
try:
    GRB_INT_PAR_PREDUAL = 'PreDual'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 931
try:
    GRB_INT_PAR_PREPASSES = 'PrePasses'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 932
try:
    GRB_INT_PAR_PREQLINEARIZE = 'PreQLinearize'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 933
try:
    GRB_INT_PAR_PRESOLVE = 'Presolve'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 934
try:
    GRB_DBL_PAR_PRESOS1BIGM = 'PreSOS1BigM'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 935
try:
    GRB_DBL_PAR_PRESOS2BIGM = 'PreSOS2BigM'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 936
try:
    GRB_INT_PAR_PRESPARSIFY = 'PreSparsify'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 937
try:
    GRB_INT_PAR_PREMIQCPFORM = 'PreMIQCPForm'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 938
try:
    GRB_INT_PAR_QCPDUAL = 'QCPDual'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 939
try:
    GRB_INT_PAR_RECORD = 'Record'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 940
try:
    GRB_STR_PAR_RESULTFILE = 'ResultFile'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 941
try:
    GRB_INT_PAR_SEED = 'Seed'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 942
try:
    GRB_INT_PAR_THREADS = 'Threads'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 943
try:
    GRB_DBL_PAR_TUNETIMELIMIT = 'TuneTimeLimit'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 944
try:
    GRB_INT_PAR_TUNERESULTS = 'TuneResults'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 945
try:
    GRB_INT_PAR_TUNECRITERION = 'TuneCriterion'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 946
try:
    GRB_INT_PAR_TUNETRIALS = 'TuneTrials'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 947
try:
    GRB_INT_PAR_TUNEOUTPUT = 'TuneOutput'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 948
try:
    GRB_INT_PAR_TUNEJOBS = 'TuneJobs'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 949
try:
    GRB_INT_PAR_UPDATEMODE = 'UpdateMode'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 950
try:
    GRB_INT_PAR_OBJNUMBER = 'ObjNumber'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 951
try:
    GRB_INT_PAR_MULTIOBJMETHOD = 'MultiObjMethod'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 952
try:
    GRB_INT_PAR_MULTIOBJPRE = 'MultiObjPre'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 953
try:
    GRB_INT_PAR_POOLSOLUTIONS = 'PoolSolutions'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 954
try:
    GRB_DBL_PAR_POOLGAP = 'PoolGap'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 955
try:
    GRB_INT_PAR_POOLSEARCHMODE = 'PoolSearchMode'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 956
try:
    GRB_STR_PAR_DUMMY = 'Dummy'
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 961
try:
    GRB_CUTS_AUTO = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 962
try:
    GRB_CUTS_OFF = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 963
try:
    GRB_CUTS_CONSERVATIVE = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 964
try:
    GRB_CUTS_AGGRESSIVE = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 965
try:
    GRB_CUTS_VERYAGGRESSIVE = 3
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 967
try:
    GRB_PRESOLVE_AUTO = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 968
try:
    GRB_PRESOLVE_OFF = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 969
try:
    GRB_PRESOLVE_CONSERVATIVE = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 970
try:
    GRB_PRESOLVE_AGGRESSIVE = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 972
try:
    GRB_METHOD_AUTO = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 973
try:
    GRB_METHOD_PRIMAL = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 974
try:
    GRB_METHOD_DUAL = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 975
try:
    GRB_METHOD_BARRIER = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 976
try:
    GRB_METHOD_CONCURRENT = 3
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 977
try:
    GRB_METHOD_DETERMINISTIC_CONCURRENT = 4
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 979
try:
    GRB_BARHOMOGENEOUS_AUTO = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 980
try:
    GRB_BARHOMOGENEOUS_OFF = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 981
try:
    GRB_BARHOMOGENEOUS_ON = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 983
try:
    GRB_MIPFOCUS_BALANCED = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 984
try:
    GRB_MIPFOCUS_FEASIBILITY = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 985
try:
    GRB_MIPFOCUS_OPTIMALITY = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 986
try:
    GRB_MIPFOCUS_BESTBOUND = 3
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 988
try:
    GRB_BARORDER_AUTOMATIC = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 989
try:
    GRB_BARORDER_AMD = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 990
try:
    GRB_BARORDER_NESTEDDISSECTION = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 992
try:
    GRB_SIMPLEXPRICING_AUTO = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 993
try:
    GRB_SIMPLEXPRICING_PARTIAL = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 994
try:
    GRB_SIMPLEXPRICING_STEEPEST_EDGE = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 995
try:
    GRB_SIMPLEXPRICING_DEVEX = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 996
try:
    GRB_SIMPLEXPRICING_STEEPEST_QUICK = 3
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 998
try:
    GRB_VARBRANCH_AUTO = (-1)
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 999
try:
    GRB_VARBRANCH_PSEUDO_REDUCED = 0
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 1000
try:
    GRB_VARBRANCH_PSEUDO_SHADOW = 1
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 1001
try:
    GRB_VARBRANCH_MAX_INFEAS = 2
except:
    pass

# /opt/gurobi702/linux64/include/gurobi_c.h: 1002
try:
    GRB_VARBRANCH_STRONG = 3
except:
    pass

_GRBmodel = struct__GRBmodel # /opt/gurobi702/linux64/include/gurobi_c.h: 8

_GRBenv = struct__GRBenv # /opt/gurobi702/linux64/include/gurobi_c.h: 9

_GRBsvec = struct__GRBsvec # /opt/gurobi702/linux64/include/gurobi_c.h: 754

# No inserted files

