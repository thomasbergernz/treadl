import configparser

def normalise_colour(max_color, triplet):
  color_factor = 256/max_color
  components = triplet.split(',')
  new_components = []
  for component in components:
    new_components.append(str(int(float(color_factor) * int(component))))
  return ','.join(new_components)

def denormalise_colour(max_color, triplet):
  color_factor = max_color/256
  components = triplet.split(',')
  new_components = []
  for component in components:
    new_components.append(str(int(float(color_factor) * int(component))))
  return ','.join(new_components)

def get_colour_index(colours, colour):
  for (index, c) in enumerate(colours):
    if c == colour: return index + 1
  return 1

def dumps(obj):
  if not obj or not obj['pattern']: raise Exception('Invalid pattern')
  wif = []

  wif.append('[WIF]')
  wif.append('Version=1.1')
  wif.append('Source Program=Treadl')
  wif.append('Source Version=1')

  wif.append('\n[CONTENTS]')
  wif.append('COLOR PALETTE=true')
  wif.append('TEXT=true')
  wif.append('WEAVING=true')
  wif.append('WARP=true')
  wif.append('WARP COLORS=true')
  wif.append('WEFT COLORS=true')
  wif.append('WEFT=true')
  wif.append('COLOR TABLE=true')
  wif.append('THREADING=true')
  wif.append('TIEUP=true')
  wif.append('TREADLING=true')

  wif.append('\n[TEXT]')
  wif.append('Title={0}'.format(obj['name']))

  wif.append('\n[COLOR TABLE]')
  for (index, colour) in enumerate(obj['pattern']['colours']):
    wif.append('{0}={1}'.format(index + 1, denormalise_colour(999, colour)))

  wif.append('\n[COLOR PALETTE]')
  wif.append('Range=0,999')
  wif.append('Entries={0}'.format(len(obj['pattern']['colours'])))

  wif.append('\n[WEAVING]')
  wif.append('Rising Shed=true')
  wif.append('Treadles={0}'.format(obj['pattern']['weft']['treadles']))
  wif.append('Shafts={0}'.format(obj['pattern']['warp']['shafts']))
 
  wif.append('\n[WARP]')
  wif.append('Units=centimeters')
  wif.append('Color={0}'.format(get_colour_index(obj['pattern']['colours'], obj['pattern']['warp']['defaultColour'])))
  wif.append('Threads={0}'.format(obj['pattern']['warp']['threads']))
  wif.append('Spacing=0.212')
  wif.append('Thickness=0.212')

  wif.append('\n[WARP COLORS]')
  for (index, thread) in enumerate(obj['pattern']['warp']['threading']):
    if 'colour' in thread:
      wif.append('{0}={1}'.format(index + 1, get_colour_index(obj['pattern']['colours'], thread['colour'])))

  wif.append('\n[THREADING]')
  for (index, thread) in enumerate(obj['pattern']['warp']['threading']):
    wif.append('{0}={1}'.format(index + 1, thread['shaft'])) 

  wif.append('\n[WEFT]')
  wif.append('Units=centimeters')
  wif.append('Color={0}'.format(get_colour_index(obj['pattern']['colours'], obj['pattern']['weft']['defaultColour'])))
  wif.append('Threads={0}'.format(obj['pattern']['weft']['threads']))
  wif.append('Spacing=0.212')
  wif.append('Thickness=0.212')

  wif.append('\n[WEFT COLORS]')
  for (index, thread) in enumerate(obj['pattern']['weft']['treadling']):
    if 'colour' in thread:
      wif.append('{0}={1}'.format(index + 1, get_colour_index(obj['pattern']['colours'], thread['colour'])))

  wif.append('\n[TREADLING]')
  for (index, thread) in enumerate(obj['pattern']['weft']['treadling']):
    wif.append('{0}={1}'.format(index + 1, thread['treadle'])) 

  wif.append('\n[TIEUP]')
  for (index, tieup) in enumerate(obj['pattern']['tieups']):
    wif.append('{0}={1}'.format(str(index + 1), ','.join(str(x) for x in tieup)))

  return '\n'.join(wif)

def loads(wif_file):
  config = configparser.ConfigParser(allow_no_value=True, strict=False)
  config.read_string(wif_file.lower())
  draft = {}

  text = config['text']
  draft['name'] = text.get('title')

  min_color = 0
  max_color = 255
  if 'color palette' in config:
    color_palette = config['color palette']
    color_range = color_palette.get('range').split(',')
    min_color = int(color_range[0])
    max_color = int(color_range[1])

  if 'color table' in config:
    color_table = config['color table']
    draft['colours'] = [None]*len(color_table)
    for x in color_table:
      draft['colours'][int(x)-1] = normalise_colour(max_color, color_table[x])
  if not draft.get('colours'): draft['colours'] = []
  if len(draft['colours']) < 2:
    draft['colours'] += [normalise_colour(255, '255,255,255'), normalise_colour(255, '0,0,255')]

  weaving = config['weaving']

  threading = config['threading']
  warp = config['warp']
  draft['warp'] = {}
  draft['warp']['shafts'] = weaving.getint('shafts')
  draft['warp']['threading'] = []
  draft['warp']['defaultColour'] = draft['colours'][warp.getint('color')-1]
  warp_colour_index = warp.getint('color') - 1
  # In case of no color table or colour index out of bounds
  draft['warp']['defaultColour'] = draft['colours'][warp_colour_index] if len(draft['colours']) > warp_colour_index else draft['colours'][0]
  for x in threading:
    while int(x) >= len(draft['warp']['threading']) - 1:
      draft['warp']['threading'].append({'shaft': 0})
    draft['warp']['threading'][int(x) - 1] = {'shaft': int(threading[x])}
  draft['warp']['threads'] = len(draft['warp']['threading'])
  try:
    warp_colours = config['warp colors']
    for x in warp_colours:
      draft['warp']['threading'][int(x) - 1]['colour'] = draft['colours'][warp_colours.getint(x)-1]
  except Exception as e:
    pass

  treadling = config['treadling']
  weft = config['weft']
  draft['weft'] = {}
  draft['weft']['treadles'] = weaving.getint('treadles')
  draft['weft']['treadling'] = []
  weft_colour_index = weft.getint('color') - 1
  # In case of no color table or colour index out of bounds 
  draft['weft']['defaultColour'] = draft['colours'][weft_colour_index] if len(draft['colours']) > weft_colour_index else draft['colours'][1]

  for x in treadling:
    while int(x) >= len(draft['weft']['treadling']) - 1:
      draft['weft']['treadling'].append({'treadle': 0})
    draft['weft']['treadling'][int(x) - 1] = {'treadle': int(treadling[x])}
  draft['weft']['threads'] = len(draft['weft']['treadling'])
  try:
    weft_colours = config['weft colors']
    for x in weft_colours:
      draft['weft']['treadling'][int(x) - 1]['colour'] = draft['colours'][weft_colours.getint(x)-1]
  except: pass

  tieup = config['tieup']
  draft['tieups'] = []#[0]*len(tieup)
  for x in tieup:
    while int(x) >= len(draft['tieups']) - 1:
      draft['tieups'].append([])
    split = tieup[x].split(',')
    try:
      draft['tieups'][int(x)-1] = [int(i) for i in split]
    except:
      draft['tieups'][int(x)-1] = []

  return draft
