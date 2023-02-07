\c biztime
DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry TEXT NOT NULL
);

CREATE TABLE company_industries (
  comp_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  ind_code TEXT NOT NULL REFERENCES industries ON DELETE CASCADE
);

ALTER TABLE company_industries ADD CONSTRAINT no_dups UNIQUE (comp_code, ind_code);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('cat', 'Caterpillar', 'DJIA stalwart');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code, industry)
  VALUES ('acct', 'Accounting'),
         ('farm', 'Farming'),
         ('game', 'Gambling'),
         ('info', 'Information Technology');

INSERT INTO company_industries
  VALUES ('apple', 'info'),
         ('cat', 'farm'),
         ('apple', 'acct'),
         ('ibm', 'info');