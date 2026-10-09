#!/usr/bin/env python3
"""Sestaví návrh webu účetní kanceláře VM&kolektiv (obsah _data/web.json, šablona src/)."""
import json, os, shutil, hashlib, datetime
from jinja2 import Environment, FileSystemLoader

ROOT = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(ROOT, '_data', 'web.json'), encoding='utf-8'))
ROK = datetime.date.today().year

os.makedirs(os.path.join(ROOT, 'assets'), exist_ok=True)
for n in ('style.css', 'main.js'):
    shutil.copy(os.path.join(ROOT, 'src', n), os.path.join(ROOT, 'assets', n))
shutil.copy(os.path.join(ROOT, 'foto', 'favicon.png'), os.path.join(ROOT, 'assets', 'favicon.png'))
V = {k: hashlib.md5(open(os.path.join(ROOT, 'assets', f), 'rb').read()).hexdigest()[:8]
     for k, f in (('css', 'style.css'), ('js', 'main.js'), ('fav', 'favicon.png'))}

a = S['adresa']
LD = {
    '@context': 'https://schema.org', '@type': 'AccountingService', 'name': S['firma'],
    'description': S['description'], 'email': S['email'], 'telephone': S['telefon']['text'],
    'founder': {'@type': 'Person', 'name': S['majitelka']}, 'foundingDate': str(S['rok_kancelar']),
    'taxID': S['ico'], 'image': 'foto/hero.jpg', 'logo': 'foto/logo.png',
    'address': {'@type': 'PostalAddress', 'streetAddress': a['ulice'], 'postalCode': a['psc'],
                'addressLocality': a['mesto'], 'addressRegion': 'Zlínský kraj', 'addressCountry': 'CZ'},
    'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification',
                                   'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                                   'opens': '08:00', 'closes': '16:00'}],
    'areaServed': ['Uherské Hradiště', 'Zlínský kraj'],
    'knowsAbout': ['vedení účetnictví', 'daňová evidence', 'DPH', 'mzdy a personalistika', 'online účetnictví MRP K/S'],
}

env = Environment(loader=FileSystemLoader(os.path.join(ROOT, 'src')), autoescape=True, trim_blocks=True, lstrip_blocks=True)
html = env.get_template('index.html').render(S=S, V=V, ROK=ROK, LD=json.dumps(LD, ensure_ascii=False))
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(ROOT, '.nojekyll'), 'w').close()
open(os.path.join(ROOT, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
print('OK', V)
