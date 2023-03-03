ALTER SEQUENCE public.files_id_seq RESTART WITH 1;
ALTER SEQUENCE public.tags_id_seq RESTART WITH 1;
ALTER SEQUENCE public.questions_id_seq RESTART WITH 1;

-- INSERT INTO public.files ("filename", "md5sum", "hasBeenTagged", "mimeType", "hasContent") VALUES
--     ('Star Citizen 10_9_2021 3_37_54 PM.png',  'ec64c8b906b5babfd86dde4cb7af2429', 'f', 'image/png', 't'),
--     ('Star Citizen 1_23_2022 2_13_21 PM.png',  '0cd5f0e20fad279848a12a8f1c3f1702', 't', 'image/png', 't'),
--     ('Star Citizen 1_23_2022 2_14_35 PM.png',  'd60167333e0aabb3e5dbbae83c71d8b3', 't', 'image/png', 't'),
--     ('Star Citizen 1_9_2022 8_52_35 AM.png',   '3104bf3eab6ff1671a1f44f5bea8f59a', 't', 'image/png', 't'),
--     ('Star Citizen 1_9_2022 9_46_58 AM.png',   'cdbb38769a1626755107df18dc6db33b', 't', 'image/png', 't'),
--     ('Star Citizen 1_23_2022 9_47_44 PM.png',  'bed313a3fea4aed249b122d1d07941df', 't', 'image/png', 't'),
--     ('Star Citizen 1_23_2022 9_48_17 PM.png',  '5dd9ee58c1b9b7f4160496522f29ddea', 't', 'image/png', 't'),
--     ('Star Citizen 1_23_2022 9_47_34 PM.png',  '90ed3513dd1bf841c4c92beaa366d275', 't', 'image/png', 't'),
--     ('Star Citizen 1_23_2022 9_47_38 PM.png',  'bce03a92b94591b66c6defa2135e0097', 't', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_40_14 PM.png', 'a42ddb3a3b6079805e9a492536764d11', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_40_38 PM.png', '0ad4e06bfa001759332dc88e93773eec', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_41_03 PM.png', 'f7518356cbe46ca24c4a216b7db70c99', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_41_22 PM.png', 'e584626a3710f9e545bff3f9be6b3974', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_41_35 PM.png', 'e056c8173e5af864ed75031f32661050', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_41_48 PM.png', '2f48ce11556e5dbe8716f84e42d2df6f', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_42_10 PM.png', 'ef444e5925324088899274607e23ac8f', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_42_37 PM.png', '7849f05e096ba9a5f1a3d165a3c33147', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_42_48 PM.png', 'e6f21cde92169e46e38e3973cdea1fa0', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 7_42_56 PM.png', '67b8572a1eb8891b3905ef5afd7c9879', 'f', 'image/png', 't'),
--     ('Star Citizen 12_22_2021 8_48_06 PM.png', '45109956f12cfc4233e39c20e63ea1ba', 'f', 'image/png', 't');

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

-- INSERT INTO public.filetags ("fileid", "tagid") VALUES
--     -- 1
--     (2, 1), (2, 9), (2, 5), (2, 4), (2, 16),
--     (3, 1), (3, 11), (3, 4), (3, 16),
--     (4, 1), (4, 11), (4, 4), (4, 5),
--     (5, 1), (5, 11), (5, 4),
--     (6, 1), (6, 9), (6, 4), (6, 16),
--     (7, 1), (7, 9), (7, 4), (7, 16),
--     (8, 1), (8, 9), (8, 4), (8, 16), (8, 18),
--     (9, 1), (9, 9), (9, 4), (9, 16);
--     -- 10-20

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