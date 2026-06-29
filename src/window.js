/* window.js
 *
 * Copyright 2026 Abdulla Almansoori
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

export const IqralyWindow = GObject.registerClass({
    GTypeName: 'IqralyWindow',
    Template: 'resource:///io/github/lexeep/Iqraly/window.ui',
    InternalChildren: ['search_button','searchbar', 'searchentry', 'listbox', 'contentPage', 'stack', 'status_page', 'search_page'],
}, class IqralyWindow extends Adw.ApplicationWindow {
    constructor(application) {
        super({ application });


        const bytes = Gio.resources_lookup_data(
          '/io/github/lexeep/Iqraly/data/quran_en.json',
          Gio.ResourceLookupFlags.NONE,
        );

        const quran = JSON.parse(new TextDecoder().decode(bytes.toArray()));




        quran.forEach(surah => {
          const row = new Gtk.ListBoxRow({});
          row._surah = surah;



          const label = new Gtk.Label({
            label: `${String(surah.id).padEnd(5)} ${surah.transliteration}`,
            xalign: 0,
            margin_start: 1,
            margin_top: 4,
            margin_bottom: 4,
            css_classes: [],
            use_markup: true,
          });

          row.set_child(label);
          row.set_activatable(true);


          this._listbox.append(row);
        });

        let previousRow = null;


        this._listbox.connect('row-activated', (listbox, row) => {
            const label = row.get_child();
            const surah = row._surah;

            this._contentPage.title = surah.transliteration;

            if (previousRow) {
              const prevLabel = previousRow.get_child();
              prevLabel.set_label(`${String(previousRow._surah.id).padEnd(5)} ${previousRow._surah.transliteration}`);
            }

            label.set_label(`<b>${String(surah.id).padEnd(5)} ${surah.transliteration}</b>`);
            previousRow = row;
        });

        let results_count;

        const filter = (row) => {
          const re = new RegExp(this._searchentry.text, "i");

          const surah = row._surah;
          const label = row.get_child();

          const match = re.test(surah.transliteration);
          if (match) results_count++;
          return match;
        }

        this._listbox.set_filter_func(filter);

        this._searchentry.connect("search-changed", () => {
          results_count = -1;
          this._listbox.invalidate_filter();
          if (results_count === -1) this._stack.visible_child = this._status_page;
          else this._stack.visible_child = this._search_page
        });


    }
});

