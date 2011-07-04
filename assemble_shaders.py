
# dict of name, filename pairs.  The 'name' will be the name of the variable in javascript.
source_config = {
    'shader_fs_text': ('x-shader/x-fragment', 'shader_sources/shader_fs.txt'),
    'shader_vs_text': ('x-shader/x-vertex', 'shader_sources/shader_vs.txt'),
    'particles_shader_fs_text': ('x-shader/x-fragment', 'shader_sources/particles_shader_fs.txt'),
    'particles_shader_vs_text': ('x-shader/x-vertex', 'shader_sources/particles_shader_vs.txt'),
    'terrain_shader_fs_text': ('x-shader/x-fragment', 'shader_sources/terrain_shader_fs.txt'),
    'terrain_shader_vs_text': ('x-shader/x-vertex', 'shader_sources/terrain_shader_vs.txt'),
}

def read():
    sources = {}
    for name, (ty, fname) in source_config.iteritems():
        with open(fname, 'r') as f:
            sources[name] = (ty, f.read())
    return sources


def write(destname, sources):
    def iter_contents():
        for name, (ty, data) in sources.iteritems():
            ##data = data.replace('"', '\\"')
            assert '"' not in data
            lines = data.splitlines()
            yield '{0}: {{ type: "{1}", data: "{2}" }}'.format(name, ty, '\\n\\\n'.join(lines))
        
    with open(destname, 'w') as f:
        f.write('fireworks.shaders = {\n')
        f.write(',\n'.join(iter_contents()))
        f.write('\n}\n')


def main():
    destname = 'fireworks/shaders.js'
    sources = read()
    write(destname, sources)


if __name__ == '__main__':
    main()
