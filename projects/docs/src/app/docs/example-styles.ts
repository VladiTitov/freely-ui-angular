/*
 * Layouts of the examples, as host classes styled in styles.css. Not shared inline `styles`: in @angular/build
 * 21.2.14+ two components of one file with identical inline styles leave `ng build` hanging after it is done
 * (angular/angular-cli#33497), and the fix is not in 21.x.
 */

/** Lays an example out as a wrapping row. */
export const ROW = { class: 'docs-row' };

/** Lays an example out as a column of at most a form's width. */
export const COLUMN = { class: 'docs-column' };
