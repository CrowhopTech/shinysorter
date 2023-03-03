BEGIN transaction;

ALTER SEQUENCE public.tags_id_seq RESTART WITH 1;
ALTER SEQUENCE public.questions_id_seq RESTART WITH 1;

DELETE FROM public.questionoptions WHERE true;
DELETE FROM public.questions WHERE true;
DELETE FROM public.tags WHERE true;

INSERT INTO public.tags ("name", "description") VALUES
    ( 'Star Citizen', 'This file is from Star Citizen'),
    ( 'Elite Dangerous', 'This file is from Elite: Dangerous'),
    ( 'Other Vehicle', 'This image contains another vehicle not listed above'),
    ( 'Cutlass Black', ''),
    ( 'ROC Miner', ''),
    ( 'Avenger Titan (Pingu)', ''),
    ( 'Aurora MR', ''),
    ( 'In-Cockpit', 'Taken from a seated, in-cockpit position'),
    ( 'Outside Ship', 'Taken from third person while in a ship seat'),
    ( 'First-Person Character', 'Taken from a first-person on-foot perspective'),
    ( 'Third-Person Character', 'Taken from a third-person on-foot perspective'),
    ( 'Planets', ''),
    ( 'Stars', ''),
    ( 'Nebulae', ''),
    ( 'Stations', ''),
    ( 'Terrain', ''),
    ( 'Cities', ''),
    ( 'Clouds', '');

INSERT INTO public.questions ("orderingID", "questionText", "mutuallyExclusive") VALUES
    (1, 'Is this picture from a video game?', true),
    (3, 'Is there a vehicle in this picture?', false),
    (2, 'What perspective is this picture taken in?', true),
    (4, 'What scenery is present in this picture?', false);

INSERT INTO public.questionoptions ("questionid", "tagid", "optiontext") VALUES
    (1, 1, 'Star Citizen'),
    (1, 2, 'Elite: Dangerous'),
    (2, 3, 'Yes (other vehicle)'),
    (2, 4, 'Cutlass Black'),
    (2, 5, 'ROC Miner'),
    (2, 6, 'Avenger Titan (Pingu!)'),
    (2, 7, 'Aurora MR'),
    (3, 8, 'From inside a ship cockpit'),
    (3, 9, 'Third person ship view'),
    (3, 10, 'From a first-person character view'),
    (3, 11, 'From a third-person character view'),
    (4, 12, 'Planets'),
    (4, 13, 'Stars'),
    (4, 14, 'Nebulae'),
    (4, 15, 'Stations'),
    (4, 16, 'Terrain'),
    (4, 17, 'Cities'),
    (4, 18, 'Clouds');
    

END transaction;